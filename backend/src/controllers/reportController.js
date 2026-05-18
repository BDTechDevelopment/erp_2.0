const { prisma } = require("../prisma");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

const STATUS_LABELS = { pending: "Pendente", confirmed: "Confirmado", cancelled: "Cancelado" };

const INCLUDE = { person: true, pricings: { include: { pricing: true } } };

function buildWhere(userId, query) {
  const { startDate, endDate, status, personId } = query;
  const where = { userId };
  if (startDate && endDate) {
    where.activityDate = {
      gte: new Date(startDate + "T00:00:00.000Z"),
      lte: new Date(endDate + "T23:59:59.999Z"),
    };
  }
  if (status) where.status = status;
  if (personId) where.personId = personId;
  return where;
}

function buildFinancial(activities) {
  const withPrice = activities.filter(a => a.price != null);
  const confirmed = withPrice.filter(a => a.status === "confirmed");
  const pending   = withPrice.filter(a => a.status === "pending");
  const cancelled = withPrice.filter(a => a.status === "cancelled");

  const sum = arr => arr.reduce((acc, a) => acc + (a.price || 0), 0);

  // breakdown por serviço
  const serviceMap = {};
  activities.forEach(a => {
    (a.pricings || []).forEach(ap => {
      const name = ap.pricing?.name || "Sem nome";
      if (!serviceMap[name]) serviceMap[name] = { count: 0, total: 0 };
      serviceMap[name].count += 1;
      serviceMap[name].total += ap.pricing?.price || 0;
    });
  });

  return {
    received:  sum(confirmed),
    expected:  sum(pending),
    lost:      sum(cancelled),
    gross:     sum(confirmed) + sum(pending),
    byService: Object.entries(serviceMap)
      .map(([name, v]) => ({ name, count: v.count, total: v.total }))
      .sort((a, b) => b.total - a.total),
  };
}

async function getActivityReport(req, res) {
  const where = buildWhere(req.user.id, req.query);
  const activities = await prisma.activity.findMany({
    where,
    include: INCLUDE,
    orderBy: [{ activityDate: "asc" }, { time: "asc" }],
  });

  const summary = {
    total:     activities.length,
    pending:   activities.filter(a => a.status === "pending").length,
    confirmed: activities.filter(a => a.status === "confirmed").length,
    cancelled: activities.filter(a => a.status === "cancelled").length,
    financial: buildFinancial(activities),
  };

  res.json({ activities, summary });
}

async function exportExcel(req, res) {
  const where = buildWhere(req.user.id, req.query);
  const type  = req.query.type || "agendamentos"; // "agendamentos" | "balanco"
  const activities = await prisma.activity.findMany({
    where,
    include: INCLUDE,
    orderBy: [{ activityDate: "asc" }, { time: "asc" }],
  });

  const wb = new ExcelJS.Workbook();

  if (type === "balanco") {
    const fin = buildFinancial(activities);
    const ws  = wb.addWorksheet("Balanço Financeiro");

    ws.addRow(["Balanço Financeiro"]);
    ws.addRow([]);
    ws.addRow(["Situação", "Valor (R$)"]);
    ws.addRow(["Recebido (confirmados)", fin.received]);
    ws.addRow(["Esperado (pendentes)",   fin.expected]);
    ws.addRow(["Perdido (cancelados)",   fin.lost]);
    ws.addRow(["Total bruto",            fin.gross]);
    ws.addRow([]);
    ws.addRow(["Por Serviço"]);
    ws.addRow(["Serviço", "Qtd", "Total (R$)"]);
    fin.byService.forEach(s => ws.addRow([s.name, s.count, s.total]));
  } else {
    const ws = wb.addWorksheet("Agendamentos");
    ws.columns = [
      { header: "Data",      key: "date",     width: 15 },
      { header: "Horário",   key: "time",     width: 10 },
      { header: "Título",    key: "title",    width: 30 },
      { header: "Cliente",   key: "person",   width: 25 },
      { header: "Serviços",  key: "services", width: 30 },
      { header: "Valor",     key: "price",    width: 15 },
      { header: "Descrição", key: "desc",     width: 35 },
      { header: "Status",    key: "status",   width: 15 },
    ];
    activities.forEach(a => {
      ws.addRow({
        date:     new Date(a.activityDate).toLocaleDateString("pt-BR"),
        time:     a.time || "–",
        title:    a.title,
        person:   a.person?.name || "–",
        services: (a.pricings || []).map(ap => ap.pricing?.name).filter(Boolean).join(", ") || "–",
        price:    a.price != null ? a.price : "–",
        desc:     a.description || "–",
        status:   STATUS_LABELS[a.status] || a.status,
      });
    });
  }

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=${type}.xlsx`);
  await wb.xlsx.write(res);
  res.end();
}

async function exportPDF(req, res) {
  const where = buildWhere(req.user.id, req.query);
  const type  = req.query.type || "agendamentos";
  const activities = await prisma.activity.findMany({
    where,
    include: INCLUDE,
    orderBy: [{ activityDate: "asc" }, { time: "asc" }],
  });

  const doc = new PDFDocument({ margin: 40 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${type}.pdf`);
  doc.pipe(res);

  doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, { align: "right" });
  doc.moveDown(0.5);

  if (type === "balanco") {
    doc.fontSize(18).text("Balanço Financeiro", { align: "center" });
    doc.moveDown();

    const fin = buildFinancial(activities);
    doc.fontSize(13).text("Resumo", { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(11)
      .text(`Recebido (confirmados): R$ ${fin.received.toFixed(2)}`)
      .text(`Esperado (pendentes):   R$ ${fin.expected.toFixed(2)}`)
      .text(`Perdido (cancelados):   R$ ${fin.lost.toFixed(2)}`)
      .text(`Total bruto:            R$ ${fin.gross.toFixed(2)}`);
    doc.moveDown();

    if (fin.byService.length > 0) {
      doc.fontSize(13).text("Por Serviço", { underline: true });
      doc.moveDown(0.3);
      fin.byService.forEach(s => {
        doc.fontSize(10).text(`${s.name}  —  ${s.count}x  —  R$ ${s.total.toFixed(2)}`);
      });
    }
  } else {
    doc.fontSize(18).text("Relatório de Agendamentos", { align: "center" });
    doc.moveDown();

    if (activities.length === 0) {
      doc.fontSize(12).text("Nenhum agendamento encontrado para o período.");
    } else {
      activities.forEach(a => {
        const date     = new Date(a.activityDate).toLocaleDateString("pt-BR");
        const services = (a.pricings || []).map(ap => ap.pricing?.name).filter(Boolean).join(", ");
        const price    = a.price != null ? `R$ ${Number(a.price).toFixed(2)}` : "–";
        doc.fontSize(11).text(`${date}${a.time ? " às " + a.time : ""} — ${a.title}`);
        doc.fontSize(9)
          .text(`Cliente: ${a.person?.name || "–"}   |   Status: ${STATUS_LABELS[a.status] || a.status}   |   Valor: ${price}`);
        if (services) doc.text(`Serviços: ${services}`);
        if (a.description) doc.text(`Obs: ${a.description}`);
        doc.moveDown(0.4);
      });
    }
  }

  doc.end();
}

module.exports = { getActivityReport, exportExcel, exportPDF };
