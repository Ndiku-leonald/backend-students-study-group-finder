const routes = require('./routes');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const authRoutes = require('./routes/authRoutes');
app.use(express.json());
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send("API is running");
});

app.use('/', routes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));