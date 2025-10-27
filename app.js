const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

// Skapar express-app för arbetserfarenheter
const app = express();
const port = process.env.PORT || 3001; // Kör på port 3001 för att inte krocka med andra appar

// Databas-setup
const databas = new sqlite3.Database('./cv.db', (err) => {
    if (err) {
        console.error('Kunde inte öppna databasen:', err.message);
    } else {
        console.log('Ansluten till SQLite-databasen');
        // Skapar tabellen för arbetserfarenheter om den inte finns
        databas.run(`CREATE TABLE IF NOT EXISTS workexperience (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            companyname TEXT NOT NULL,
            jobtitle TEXT NOT NULL,
            location TEXT NOT NULL,
            startdate TEXT NOT NULL,
            enddate TEXT,
            description TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// Middleware, CORS aktiverat för cross-origin requests
app.use(cors({
    origin: true, // Tillåter alla domäner
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Hjälpfunktion för att validera input 
const valideraArbetslivserfarenhet = (data) => {
    const fel = [];

    if (!data.companyname || data.companyname.trim() === '') {
        fel.push('Företagsnamn måste fyllas i');
    }

    if (!data.jobtitle || data.jobtitle.trim() === '') {
        fel.push('Jobbtitel måste fyllas i');
    }

    if (!data.location || data.location.trim() === '') {
        fel.push('Plats måste fyllas i');
    }

    if (!data.startdate || data.startdate.trim() === '') {
        fel.push('Startdatum måste fyllas i');
    }

    if (!data.description || data.description.trim() === '') {
        fel.push('Beskrivning måste fyllas i');
    }

    // Kollar att datum är i rätt format (YYYY-MM-DD)
    const datumRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (data.startdate && !datumRegex.test(data.startdate)) {
        fel.push('Startdatum måste vara i format YYYY-MM-DD');
    }

    if (data.enddate && data.enddate.trim() !== '' && !datumRegex.test(data.enddate)) {
        fel.push('Slutdatum måste vara i format YYYY-MM-DD');
    }

    return fel;
};

// Routes

// Hämta alla arbetserfarenheter, sorterat efter startdatum
app.get('/api/workexperience', (req, res) => {
    console.log('Hämtar alla arbetserfarenheter...'); // Debug-info

    databas.all('SELECT * FROM workexperience ORDER BY startdate DESC', (err, rader) => {
        if (err) {
            console.error('Databasfel:', err);
            return res.status(500).json({
                error: 'Serverfel',
                message: 'Kunde inte hämta arbetserfarenheter'
            });
        }

        console.log(`Hittade ${rader.length} arbetserfarenheter`);
        res.json({
            success: true,
            data: rader,
            count: rader.length
        });
    });
});

// Hämta specifik arbetserfarenhet med ID
app.get('/api/workexperience/:id', (req, res) => {
    const id = req.params.id;

    // Kollar att ID är ett nummer
    if (isNaN(id)) {
        return res.status(400).json({
            error: 'Invalid ID format',
            message: 'ID must be a number'
        });
    }

    db.get('SELECT * FROM workexperience WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to retrieve work experience'
            });
        }

        if (!row) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Work experience not found'
            });
        }

        res.json({
            success: true,
            data: row
        });
    });
});

// Skapa ny erfarenhet
app.post('/api/workexperience', (req, res) => {
    const { companyname, jobtitle, location, startdate, enddate, description } = req.body;

    console.log('Försöker skapa ny arbetslivserfarenhet för:', companyname);

    // Validerar input-data
    const valideringsfel = valideraArbetslivserfarenhet(req.body);
    if (valideringsfel.length > 0) {
        console.log('Valideringsfel:', valideringsfel);
        return res.status(400).json({
            error: 'Valideringsfel',
            message: 'Vänligen rätta följande fel',
            details: valideringsfel
        });
    }

    // Sparar i databasen
    const sql = `INSERT INTO workexperience (companyname, jobtitle, location, startdate, enddate, description) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

    databas.run(sql, [
        companyname.trim(),
        jobtitle.trim(),
        location.trim(),
        startdate.trim(),
        enddate ? enddate.trim() : null,
        description.trim()
    ], function (err) {
        if (err) {
            console.error('Databasfel vid skapande:', err);
            return res.status(500).json({
                error: 'Serverfel',
                message: 'Kunde inte skapa arbetslivserfarenhet'
            });
        }

        console.log('Ny arbetslivserfarenhet skapad med ID:', this.lastID);

        // Hämtar den skapade posten för att returnera den
        databas.get('SELECT * FROM workexperience WHERE id = ?', [this.lastID], (err, rad) => {
            if (err) {
                console.error('Databasfel vid hämtning:', err);
                return res.status(500).json({
                    error: 'Serverfel',
                    message: 'Arbetslivserfarenhet skapad men kunde inte hämtas'
                });
            }

            res.status(201).json({
                success: true,
                message: 'Arbetslivserfarenhet skapad framgångsrikt',
                data: rad
            });
        });
    });
});

// Uppdatera arbetserfarenhet
app.put('/api/workexperience/:id', (req, res) => {
    const id = req.params.id;
    const { companyname, jobtitle, location, startdate, enddate, description } = req.body;

    // Kollar att ID är ett nummer
    if (isNaN(id)) {
        return res.status(400).json({
            error: 'Ogiltigt ID-format',
            message: 'ID måste vara ett nummer'
        });
    }

    // Validerar input-data
    const valideringsfel = valideraArbetslivserfarenhet(req.body);
    if (valideringsfel.length > 0) {
        return res.status(400).json({
            error: 'Valideringsfel',
            message: 'Vänligen rätta följande fel',
            details: valideringsfel
        });
    }

    // Kollar om posten finns
    databas.get('SELECT * FROM workexperience WHERE id = ?', [id], (err, rad) => {
        if (err) {
            console.error('Databasfel:', err);
            return res.status(500).json({
                error: 'Serverfel',
                message: 'Kunde inte kontrollera arbetserfarenhet'
            });
        }

        if (!rad) {
            return res.status(404).json({
                error: 'Hittades inte',
                message: 'Arbetserfarenhet hittades inte'
            });
        }

        // Uppdaterar posten
        const sql = `UPDATE workexperience 
                     SET companyname = ?, jobtitle = ?, location = ?, startdate = ?, enddate = ?, description = ?
                     WHERE id = ?`;

        databas.run(sql, [
            companyname.trim(),
            jobtitle.trim(),
            location.trim(),
            startdate.trim(),
            enddate ? enddate.trim() : null,
            description.trim(),
            id
        ], function (err) {
            if (err) {
                console.error('Databasfel vid uppdatering:', err);
                return res.status(500).json({
                    error: 'Serverfel',
                    message: 'Kunde inte uppdatera arbetserfarenhet'
                });
            }

            // Returnerar den uppdaterade posten
            databas.get('SELECT * FROM workexperience WHERE id = ?', [id], (err, uppdateradRad) => {
                if (err) {
                    console.error('Databasfel vid hämtning:', err);
                    return res.status(500).json({
                        error: 'Serverfel',
                        message: 'Arbetserfarenhet uppdaterad men kunde inte hämtas'
                    });
                }

                res.json({
                    success: true,
                    message: 'Arbetserfarenhet uppdaterad framgångsrikt',
                    data: uppdateradRad
                });
            });
        });
    });
});

// Ta bort arbetserfarenhet
app.delete('/api/workexperience/:id', (req, res) => {
    const id = req.params.id;

    // Kollar att ID är ett nummer
    if (isNaN(id)) {
        return res.status(400).json({
            error: 'Ogiltigt ID-format',
            message: 'ID måste vara ett nummer'
        });
    }

    // Kollar om posten finns först
    databas.get('SELECT * FROM workexperience WHERE id = ?', [id], (err, rad) => {
        if (err) {
            console.error('Databasfel:', err);
            return res.status(500).json({
                error: 'Serverfel',
                message: 'Kunde inte kontrollera arbetserfarenhet'
            });
        }

        if (!rad) {
            return res.status(404).json({
                error: 'Hittades inte',
                message: 'Arbetserfarenhet hittades inte'
            });
        }

        // Raderar posten
        databas.run('DELETE FROM workexperience WHERE id = ?', [id], function (err) {
            if (err) {
                console.error('Databasfel vid radering:', err);
                return res.status(500).json({
                    error: 'Serverfel',
                    message: 'Kunde inte ta bort arbetserfarenhet'
                });
            }

            res.json({
                success: true,
                message: 'Arbetserfarenhet borttagen framgångsrikt',
                data: rad
            });
        });
    });
});

// Root endpoint med API information
app.get('/', (req, res) => {
    res.json({
        message: 'Arbetserfarenheter API',
        version: '1.0.0',
        endpoints: {
            'GET /api/workexperience': 'Hämta alla arbetserfarenheter',
            'GET /api/workexperience/:id': 'Hämta specifik arbetserfarenhet',
            'POST /api/workexperience': 'Skapa ny arbetserfarenhet',
            'PUT /api/workexperience/:id': 'Uppdatera arbetserfarenhet',
            'DELETE /api/workexperience/:id': 'Ta bort arbetserfarenhet'
        },
        documentation: 'Se README.md för detaljerad API-dokumentation'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: 'The requested endpoint does not exist'
    });
});

// Felhantering middleware
app.use((err, req, res, next) => {
    console.error('Ohanterat fel:', err);
    res.status(500).json({
        error: 'Serverfel',
        message: 'Något gick fel'
    });
});

// Startar servern
app.listen(port, () => {
    console.log(`Arbetserfarenheter API körs på http://localhost:${port}`);
    console.log(`API-endpoints finns på http://localhost:${port}/api/workexperience`);
    console.log('Tryck Ctrl+C för att stoppa servern');
});

// Stänger ner servern
process.on('SIGINT', () => {
    console.log('\nStänger ner servern...');
    databas.close((err) => {
        if (err) {
            console.error('Fel vid stängning av databas:', err.message);
        } else {
            console.log('Databasanslutning stängd');
        }
        process.exit(0);
    });
});