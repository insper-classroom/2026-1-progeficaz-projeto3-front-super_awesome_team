function montarCampo(id, valor) {
  const texto = String(valor ?? "");
  const tamanho = texto.length;

  if (tamanho > 99) {
    throw new Error(`Campo PIX ${id} excede 99 caracteres`);
  }

  return `${id}${String(tamanho).padStart(2, "0")}${texto}`;
}

function normalizarTexto(valor, fallback, limite) {
  const texto = String(valor || fallback)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 .,&/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limite);

  return texto || fallback;
}

function normalizarTxid(valor) {
  const texto = String(valor || "")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 25);

  return texto || "***";
}

function calcularCrc16(payload) {
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i += 1) {
    crc ^= payload.charCodeAt(i) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function gerarPixBrCode({
  pixKey,
  amount,
  receiverName,
  receiverCity = "BRASILIA",
  txid,
}) {
  const chave = String(pixKey || "").trim();
  const valor = Number(amount);

  if (!chave || !Number.isFinite(valor) || valor <= 0) return "";

  const merchantAccountInfo = [
    montarCampo("00", "br.gov.bcb.pix"),
    montarCampo("01", chave),
  ].join("");

  const additionalData = montarCampo("05", normalizarTxid(txid));
  const payloadSemCrc = [
    montarCampo("00", "01"),
    montarCampo("26", merchantAccountInfo),
    montarCampo("52", "0000"),
    montarCampo("53", "986"),
    montarCampo("54", valor.toFixed(2)),
    montarCampo("58", "BR"),
    montarCampo("59", normalizarTexto(receiverName, "RECEBEDOR", 25)),
    montarCampo("60", normalizarTexto(receiverCity, "BRASILIA", 15)),
    montarCampo("62", additionalData),
    "6304",
  ].join("");

  return `${payloadSemCrc}${calcularCrc16(payloadSemCrc)}`;
}
