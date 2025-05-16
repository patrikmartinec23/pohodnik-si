import express from 'express';
import { db } from './firebaseAdmin.js';

const app = express();
app.use(express.json());

app.get('/api/posts', async (req, res) => {
    const snapshot = await db.collection('posts').get();
    const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(posts);
});

app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});
