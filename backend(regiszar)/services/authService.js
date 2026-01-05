const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dolgozoRepository = require('../repositories/dolgozoRepository');

class AuthService {
  async login(felhasznaloNev, jelszo) {
    const dolgozo = await dolgozoRepository.findByFelhasznaloNev(felhasznaloNev);
    
    if (!dolgozo) {
      throw new Error('Hibás felhasználónév vagy jelszó');
    }

    const isValidPassword = await bcrypt.compare(jelszo, dolgozo.JelszoHash);
    if (!isValidPassword) {
      throw new Error('Hibás felhasználónév vagy jelszó');
    }

    const token = this.generateToken(dolgozo);
    return { token };
  }

  async register(dolgozoData) {
    // Ellenőrizzük, hogy létezik-e már ilyen felhasználónév
    const existing = await dolgozoRepository.findByFelhasznaloNev(dolgozoData.FelhasznaloNev);
    if (existing) {
      throw new Error('A felhasználónév már foglalt');
    }

    // Jelszó hash-elése
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dolgozoData.Jelszo, saltRounds);

    const newDolgozo = await dolgozoRepository.create({
      ...dolgozoData,
      JelszoHash: hashedPassword
    });

    // Jelszó kivonása a válaszból
    const { JelszoHash, ...dolgozoWithoutPassword } = newDolgozo.toJSON();
    return dolgozoWithoutPassword;
  }

  generateToken(dolgozo) {
    const payload = {
      DolgozoID: dolgozo.DolgozoID,
      Szerepkor: dolgozo.Szerepkor
    };

    const secret = process.env.JWT_SECRET || 'default_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

    return jwt.sign(payload, secret, { expiresIn });
  }

  verifyToken(token) {
    const secret = process.env.JWT_SECRET || 'default_secret';
    return jwt.verify(token, secret);
  }
}

module.exports = new AuthService();

