import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import cookieParser from 'cookie-parser';
import chalk from 'chalk';

dotenv.config();

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV;

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use('/api', apiRouter);

app.listen(PORT, () => {
  const now = new Date().toLocaleString();
  console.log(chalk.greenBright.bold(`🚀 Server started successfully!`));
  console.log(chalk.blueBright(`📅 Date: ${now}`));
  console.log(chalk.yellow(`🌐 Environment: ${ENV}`));
  console.log(chalk.cyan(`🔗 Listening on: http://localhost:${PORT}`));
});
