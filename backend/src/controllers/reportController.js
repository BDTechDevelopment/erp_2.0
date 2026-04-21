const { prisma } = require("../prisma");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

const STATUS_LABELS = { pending: "Pendente", confirmed: "Confirmado", cancelled: "Cancelado" };

async function buildActivityWhere(userId, query) {
  const { startDate, endDate, status, personId } = query;
  const where = { userId };

  if (startDate && endDate) {
    where.activityDate = {
      gte: new Date(startDate + "T00:00:00.000Z"),
      lte: new Date(endDate + "T23:59:59.999Z")
    };
  }

  if (status) where.status = status;
  if (personId) where.personId = personId;

  return where;
}

async function getActivityReport(req, res) {
  const where = await buildActivityWhere(req.user.id, req.query);

  const activities = await prisma.activity.findMany({
    where,
    include: { person: true },
    orderBy: [{ activityDate: "asc" }, { time: "asc" }]
  });

  const summary = {
    total: activities.length,
    pending: activities.filter(a => a.status === "pending").length,
    confirmed: activities.filter(a => a.status === "confirmed").length,
    cancelled: activities.filter(a => a.status === "cancelled").length
  };

  res.json({ activities, summary });
}

async function exportExcel(req, res) {
  const where = await buildActivityWhere(req.user.id, req.query);

  const activities = await prisma.activity.findMany({
    where,
    include: { person: true },
    orderBy: [{ activityDate: "asc" }, { time: "asc" }]
  });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Agendamentos");

  ws.columns = [
    { header: "Data", key: "date", width: 15 },
    { header: "Horário", key: "time", width: 10 },
    { header: "Título", key: "title", width: 30 },
    { header: "Cliente", key: "person", width: 25 },
    { header: "Descrição", key: "description", width: 40 },
    { header: "Status", key: "status", width: 15 }
  ];

  activities.forEach(a => {
    ws.addRow({
      date: new Date(a.activityDate).toLocaleDateString("pt-BR"),
      time: a.time || "-",
      title: a.title,
      person: a.person?.name || "-",
      description: a.description || "-",
      status: STATUS_LABELS[a.status] || a.status
    });
  });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=agendamentos.xlsx");
  await wb.xlsx.write(res);
  res.end();
}

async function exportPDF(req, res) {
  const where = await buildActivityWhere(req.user.id, req.query);

  const activities = await prisma.activity.findMany({
    where,
    include: { person: true },
    orderBy: [{ activityDate: "asc" }, { time: "asc" }]
  });

  const doc = new PDFDocument({ margin: 40 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=agendamentos.pdf");
  doc.pipe(res);

  doc.fontSize(18).text("Relatório de Agendamentos", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, { align: "right" });
  doc.moveDown();

  if (activities.length === 0) {
    doc.fontSize(12).text("Nenhum agendamento encontrado para o período.");
  } else {
    activities.forEach(a => {
      const date = new Date(a.activityDate).toLocaleDateString("pt-BR");
      doc.fontSize(12).text(`${date}${a.time ? " às " + a.time : ""} — ${a.title}`);
      doc.fontSize(10)
        .text(`Cliente: ${a.person?.name || "-"}   |   Status: ${STATUS_LABELS[a.status] || a.status}`);
      if (a.description) doc.text(`Obs: ${a.description}`);
      doc.moveDown(0.5);
    });
  }

  doc.end();
}

module.exports = { getActivityReport, exportExcel, exportPDF };
