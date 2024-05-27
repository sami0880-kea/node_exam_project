import { Router } from 'express';

const router = Router();

router.get('/api/cars/brands', async (req, res) => {
    try {
        const response = await fetch('https://api.synsbasen.dk/v1/brands/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SYNSBASEN_API_KEY}`
            },
            body: JSON.stringify({
                query: {
                    id_in: [10279, 10265, 15435, 10203, 10083, 10242, 10168, 10323, 10349, 10045, 10015, 10026, 10216, 10193, 10254, 10280, 10233, 10188, 10166, 10079, 10050, 71022, 10363, 71062, 10208, 10177, 10106, 10127, 10223, 10078, 10124, 10332, 10252, 15157, 10162, 10007, 10143, 10023, 10220, 10013, 10154, 10063, 10044, 71151]
                },
                method: 'SELECT',
                per_page: 100
            })
        });
        const data = await response.json();
        const formattedBrands = data.data.map(brand => ({
            value: brand.id,
            name: brand.name
        })).sort((a, b) => a.name.localeCompare(b.name));
        res.status(200).send({ data: formattedBrands });
    } catch (error) {
        res.status(500).send({ message: "Error fetching car brands" });
    }
});

router.get('/api/cars/models/:brandId', async (req, res) => {
    const { brandId } = req.params;
    try {
        const response = await fetch('https://api.synsbasen.dk/v1/brands/search?expand[]=models', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SYNSBASEN_API_KEY}`
            },
            body: JSON.stringify({
                query: {
                    id_in: [brandId]
                },
                method: 'SELECT',
                per_page: 100
            })
        });
        const data = await response.json();
        const formattedModels = data.data[0].models.map(model => ({
            value: model.id,
            name: model.name
        })).sort((a, b) => a.name.localeCompare(b.name));
        res.status(200).send({ data: formattedModels });
    } catch (error) {
        res.status(500).send({ message: "Error fetching car models" });
    }
});

export default router;