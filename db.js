import mysql from 'mysql2/promise';

let pool;

function getPool() {
  if (!pool) {
    const sslConfig = process.env.DB_SSL !== 'false' ? {
      ssl: { rejectUnauthorized: false }
    } : {};

    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kc',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      connectTimeout: 10000,
      ...sslConfig
    });
  }
  return pool;
}

export async function initDb() {
  console.log('Initializing database schema...');
  const conn = await getPool().getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS cafe_settings (
        id INT PRIMARY KEY DEFAULT 1,
        cafe_name VARCHAR(100) DEFAULT 'Kanchi Cafe',
        address TEXT,
        phone VARCHAR(20),
        gst_number VARCHAR(50),
        gst_percentage DECIMAL(5,2) DEFAULT 5.00,
        logo_url VARCHAR(255) DEFAULT '',
        upi_id VARCHAR(100) DEFAULT 'kanchicafe@upi'
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS printer_settings (
        id INT PRIMARY KEY DEFAULT 1,
        printer_name VARCHAR(100) DEFAULT 'Thermal Printer',
        ip_address VARCHAR(45) DEFAULT '192.168.1.100',
        port INT DEFAULT 9100
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        display_order INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url MEDIUMTEXT DEFAULT '',
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS cafe_tables (
        table_number INT PRIMARY KEY,
        status VARCHAR(20) DEFAULT 'Available'
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        table_number INT NOT NULL,
        customer_name VARCHAR(100) NOT NULL,
        customer_mobile VARCHAR(20) NOT NULL,
        status VARCHAR(30) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        notes TEXT,
        payment_screenshot MEDIUMTEXT,
        payment_reference VARCHAR(100),
        payment_time DATETIME,
        rejection_reason VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (table_number) REFERENCES cafe_tables(table_number)
      )
    `);

    try {
      const [columns] = await conn.query("SHOW COLUMNS FROM orders LIKE 'rejection_reason'");
      if (columns.length === 0) {
        await conn.query("ALTER TABLE orders ADD COLUMN rejection_reason VARCHAR(255) DEFAULT NULL");
      }
    } catch (e) {
      console.warn('Migration warning:', e.message);
    }

    // Migrate image_url to MEDIUMTEXT if needed
    try {
      const [cols] = await conn.query("SHOW COLUMNS FROM menu_items LIKE 'image_url'");
      if (cols.length > 0 && cols[0].Type.toLowerCase().includes('varchar')) {
        await conn.query("ALTER TABLE menu_items MODIFY COLUMN image_url MEDIUMTEXT DEFAULT ''");
      }
    } catch (e) {
      console.warn('Migration warning image_url:', e.message);
    }

    // Migrate payment_screenshot to MEDIUMTEXT if needed
    try {
      const [cols] = await conn.query("SHOW COLUMNS FROM orders LIKE 'payment_screenshot'");
      if (cols.length > 0 && cols[0].Type.toLowerCase().includes('varchar')) {
        await conn.query("ALTER TABLE orders MODIFY COLUMN payment_screenshot MEDIUMTEXT");
      }
    } catch (e) {
      console.warn('Migration warning payment_screenshot:', e.message);
    }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        menu_item_id INT NOT NULL,
        item_name VARCHAR(100) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        review_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed defaults
    const [settings] = await conn.query('SELECT * FROM cafe_settings LIMIT 1');
    if (settings.length === 0) {
      await conn.query(`
        INSERT INTO cafe_settings (id, cafe_name, address, phone, gst_number, gst_percentage, upi_id)
        VALUES (1, 'KANCHI CAFE', '12 Main Road, Kanchipuram, Tamil Nadu', '+91 98765 43210', '33AAAAA1111A1Z1', 5.00, 'kanchicafe@upi')
      `);
    }

    const [pSettings] = await conn.query('SELECT * FROM printer_settings LIMIT 1');
    if (pSettings.length === 0) {
      await conn.query(`
        INSERT INTO printer_settings (id, printer_name, ip_address, port)
        VALUES (1, 'Thermal Printer', '192.168.1.100', 9100)
      `);
    }

    const [tables] = await conn.query('SELECT * FROM cafe_tables LIMIT 1');
    if (tables.length === 0) {
      for (let i = 1; i <= 16; i++) {
        await conn.query('INSERT INTO cafe_tables (table_number, status) VALUES (?, "Available")', [i]);
      }
    }

    const [cats] = await conn.query('SELECT * FROM categories LIMIT 1');
    if (cats.length === 0) {
      const categoriesSeed = [
        ['Idly Section', 'idly-section', 1],
        ['Dosa 1', 'dosa-1', 2],
        ['Dosa 2', 'dosa-2', 3],
        ['Snacks & Vada', 'snacks-vada', 4],
        ['Juices', 'juices', 5],
        ['Coffee', 'coffee', 6]
      ];
      for (const [name, slug, order] of categoriesSeed) {
        await conn.query('INSERT INTO categories (name, slug, display_order, status) VALUES (?, ?, ?, "Active")', [name, slug, order]);
      }
    }

    const [menu] = await conn.query('SELECT * FROM menu_items LIMIT 1');
    if (menu.length === 0) {
      const [dbCats] = await conn.query('SELECT id, slug FROM categories');
      const catMap = {};
      dbCats.forEach(c => { catMap[c.slug] = c.id; });

      const menuSeed = [
        [catMap['idly-section'], 'Idly', 'Soft steamed rice cakes served with sambar and chutneys', 60.00],
        [catMap['idly-section'], 'Ghee Podi Idly', 'Tossed in spiced lentil powder and clarified butter', 90.00],
        [catMap['dosa-1'], 'Plain Paper Dosa', 'Crisp and thin crepe made of fermented rice-lentil batter', 110.00],
        [catMap['dosa-2'], 'Kanchi Weekend Thali', 'Special weekend meals featuring traditional south indian curries, rice, and sweet', 320.00],
        [catMap['snacks-vada'], 'Medu Vada', 'Crisp deep-fried savory fritters served with sambar', 50.00],
        [catMap['juices'], 'Oreo Milkshake', 'Creamy milkshake blended with cookies and vanilla ice cream', 140.00],
        [catMap['coffee'], 'Filter Coffee', 'Traditional South Indian frothy milk coffee brewed with chicory', 40.00]
      ];
      for (const [catId, name, desc, price] of menuSeed) {
        await conn.query('INSERT INTO menu_items (category_id, name, description, price, image_url, is_available) VALUES (?, ?, ?, ?, "", 1)', [catId, name, desc, price]);
      }
    }

    await conn.query(`
      INSERT INTO admin_users (email, password)
      VALUES ('kanchicafe@gmail.com', 'kanchi@123')
      ON DUPLICATE KEY UPDATE password = 'kanchi@123'
    `);

    console.log('Database initialization completed.');
  } catch (err) {
    console.error('DB init error:', err);
    throw err;
  } finally {
    conn.release();
  }
}

let dbInitialized = false;
export async function ensureDb() {
  if (!dbInitialized) {
    await initDb();
    dbInitialized = true;
  }
}

export default getPool;
