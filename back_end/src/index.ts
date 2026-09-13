import express, { type Request, type Response } from "express";
import morgan from "morgan";
import cors from "cors";
import gruposRoute from "./routes/grupos_route";
import horariosRoute from "./routes/horarios_route";
import { iniciarAlmacenamiento } from "./services/horarios_storage";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(morgan("dev"));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    // methods: ["GET", "POST"],
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ msj: "Hola mundo" });
});

app.use("/grupos", gruposRoute);
app.use("/horarios", horariosRoute);

await iniciarAlmacenamiento();
app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
