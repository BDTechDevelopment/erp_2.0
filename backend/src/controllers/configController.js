const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getConfig(req, res) {
  try {
    const config = await prisma.systemConfig.findUnique({ where: { id: "default" } });
    res.json(config || { companyName: "ERP System", primaryColor: "#0d6efd" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar configurações" });
  }
}

async function updateConfig(req, res) {
  try {
    const { companyName, logoUrl, primaryColor, address, phone, email } = req.body;
    const config = await prisma.systemConfig.upsert({
      where: { id: "default" },
      update: { companyName, logoUrl, primaryColor, address, phone, email },
      create: { id: "default", companyName, logoUrl, primaryColor, address, phone, email },
    });
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar configurações" });
  }
}

module.exports = { getConfig, updateConfig };
