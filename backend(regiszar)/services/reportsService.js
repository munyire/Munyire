const { models } = require('../db');
const { Op } = require('sequelize');

class ReportsService {
  async getInventoryReport() {
    const ruhak = await models.Ruha.findAll({
      order: [['Fajta', 'ASC'], ['Cikkszam', 'ASC']]
    });

    const osszesRuhaTipus = ruhak.length;
    const osszesKeszlet = ruhak.reduce((sum, r) => sum + r.Mennyiseg, 0);

    // Minőség szerinti összesítés
    const minosegSzerint = {};
    ruhak.forEach(ruha => {
      const minoseg = ruha.Minoseg || 'Uj';
      minosegSzerint[minoseg] = (minosegSzerint[minoseg] || 0) + ruha.Mennyiseg;
    });

    // Fajtánkénti összesítés
    const fajtankent = {};
    ruhak.forEach(ruha => {
      const fajta = ruha.Fajta;
      fajtankent[fajta] = (fajtankent[fajta] || 0) + ruha.Mennyiseg;
    });

    const fajtankentArray = Object.entries(fajtankent).map(([Fajta, osszMennyiseg]) => ({
      Fajta,
      osszMennyiseg
    }));

    return {
      datum: new Date().toISOString(),
      osszesites: {
        osszesRuhaTipus,
        osszesKeszlet,
        minosegSzerint
      },
      fajtankent: fajtankentArray
    };
  }

  async getEmployeeSummary() {
    const dolgozok = await models.Dolgozo.findAll({
      attributes: ['DolgozoID', 'DNev', 'Munkakor'],
      include: [{
        model: models.RuhaKiBe,
        as: 'ruhakibe',
        include: [{
          model: models.Ruha,
          as: 'ruha',
          attributes: ['Fajta']
        }]
      }]
    });

    return dolgozok.map(dolgozo => {
      const aktivKiadasok = dolgozo.ruhakibe.filter(r => !r.VisszaDatum).length;
      const osszesKiadas = dolgozo.ruhakibe.length;

      // Fajtánkénti összesítés
      const fajtankent = {};
      dolgozo.ruhakibe.forEach(rk => {
        const fajta = rk.ruha?.Fajta || 'Ismeretlen';
        fajtankent[fajta] = (fajtankent[fajta] || 0) + rk.Mennyiseg;
      });

      const ruhak = Object.entries(fajtankent).map(([Fajta, db]) => ({
        Fajta,
        db
      }));

      return {
        DolgozoID: dolgozo.DolgozoID,
        DNev: dolgozo.DNev,
        Munkakor: dolgozo.Munkakor,
        aktivKiadasok,
        osszesKiadas,
        ruhak
      };
    });
  }

  async getMonthlyReport(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const tranzakciok = await models.RuhaKiBe.findAll({
      where: {
        KiadasDatum: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: models.Ruha,
        as: 'ruha',
        attributes: ['Fajta']
      }]
    });

    // Kiadások összesítése
    const kiadasok = {
      osszesen: tranzakciok.length,
      reszletezve: {}
    };

    tranzakciok.forEach(t => {
      const fajta = t.ruha?.Fajta || 'Ismeretlen';
      kiadasok.reszletezve[fajta] = (kiadasok.reszletezve[fajta] || 0) + t.Mennyiseg;
    });

    const kiadasokReszletezve = Object.entries(kiadasok.reszletezve).map(([Fajta, db]) => ({
      Fajta,
      db
    }));

    // Visszavételek összesítése
    const visszavetelek = tranzakciok.filter(t => t.VisszaDatum);
    const visszavetelMinosegSzerint = {};
    visszavetelek.forEach(v => {
      const minoseg = v.RuhaMinoseg || 'Ismeretlen';
      visszavetelMinosegSzerint[minoseg] = (visszavetelMinosegSzerint[minoseg] || 0) + v.Mennyiseg;
    });

    return {
      ev: year,
      honap: month,
      kiadasok: {
        osszesen: kiadasok.osszesen,
        reszletezve: kiadasokReszletezve
      },
      visszavetel: {
        osszesen: visszavetelek.length,
        minosegSzerint: visszavetelMinosegSzerint
      }
    };
  }

  async getQualitySummary() {
    const visszavetelek = await models.RuhaKiBe.findAll({
      where: {
        VisszaDatum: { [Op.ne]: null },
        RuhaMinoseg: { [Op.ne]: null }
      },
      include: [{
        model: models.Ruha,
        as: 'ruha',
        attributes: ['Fajta', 'Cikkszam']
      }]
    });

    const minosegSzerint = {};
    visszavetelek.forEach(v => {
      const minoseg = v.RuhaMinoseg;
      if (!minosegSzerint[minoseg]) {
        minosegSzerint[minoseg] = {
          osszesen: 0,
          reszletek: []
        };
      }
      minosegSzerint[minoseg].osszesen += v.Mennyiseg;
      minosegSzerint[minoseg].reszletek.push({
        RuhaKiBeID: v.RuhaKiBeID,
        Cikkszam: v.ruha?.Cikkszam,
        Fajta: v.ruha?.Fajta,
        Mennyiseg: v.Mennyiseg,
        VisszaDatum: v.VisszaDatum
      });
    });

    return minosegSzerint;
  }
}

module.exports = new ReportsService();

