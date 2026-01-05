/**
 * Egységes hibakezelő middleware
 */
const errorHandlerMiddleware = (err, req, res, next) => {
  console.error('Hiba:', err);

  // Sequelize validációs hibák
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validációs hiba',
      details: err.errors.map(e => e.message).join(', ')
    });
  }

  // Sequelize egyedi megszorítás hibák (UNIQUE constraint)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'mező';
    return res.status(409).json({
      error: 'Duplikáció',
      details: `A(z) ${field} már létezik`
    });
  }

  // Sequelize foreign key hiba
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      error: 'Hivatkozási hiba',
      details: 'A hivatkozott rekord nem található'
    });
  }

  // Egyedi üzleti logikai hibák
  if (err.message) {
    // Conflict hibák (pl. nincs elég készlet)
    if (err.message.includes('készlet') || err.message.includes('létezik')) {
      return res.status(409).json({
        error: err.message
      });
    }

    // Not found hibák
    if (err.message.includes('nem található')) {
      return res.status(404).json({
        error: err.message
      });
    }

    // Egyéb üzleti logikai hibák
    return res.status(400).json({
      error: err.message
    });
  }

  // Ismeretlen hibák
  res.status(500).json({
    error: 'Belső szerver hiba',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorHandlerMiddleware;

