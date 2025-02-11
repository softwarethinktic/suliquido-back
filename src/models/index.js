const mongoose = require("mongoose");
const { Schema } = mongoose;

const DescuentosSchema = new Schema({
  otroDescuento: { type: Number, required: true },
  ICA: { type: Number, required: true },
  CREE: { type: Number, required: true },
  Faltantes: { type: Number, required: true },
  Prestamos: { type: Number, required: true },
});

const VehiculoSchema = new Schema({
  tipo: { type: String, required: true },
  placa: { type: String, required: true },
});

const ProductoSchema = new Schema({
  cantidad: { type: Number, required: true },
  nombreProducto: { type: String, required: true },
});

const ManifiestoSchema = new Schema({
  NumeroManifiesto: { type: String, unique: true, required: true },
  Fecha: { type: Date, required: true },
  Estado: {
    type: String,
    enum: ["Liquidada", "Anulada", "Cumplida"],
    required: true,
  },
  Ruta: { type: String, required: true },
  vehiculo: { type: VehiculoSchema, required: true },
  producto: { type: ProductoSchema, required: true },
  valorTons: { type: Number, required: true },
  valorFlete: { type: Number, required: true },
  Anticipos: { type: Number, required: true },
  ReteFte: { type: Number, required: true },
  Descuentos: { type: DescuentosSchema, required: true },
  Saldo: { type: Number, required: true },
});

const Manifiesto = mongoose.model("Manifiesto", ManifiestoSchema);

module.exports = Manifiesto;
