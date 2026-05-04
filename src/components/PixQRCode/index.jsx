import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function PixQRCode({ value, className, alt = "QR Code PIX" }) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    let ativo = true;

    if (!value) {
      setDataUrl("");
      return () => {
        ativo = false;
      };
    }

    QRCode.toDataURL(value, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 168,
      color: {
        dark: "#111827",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (ativo) setDataUrl(url);
      })
      .catch(() => {
        if (ativo) setDataUrl("");
      });

    return () => {
      ativo = false;
    };
  }, [value]);

  if (!value) return null;
  if (!dataUrl) return <div className={className} aria-label={alt} />;

  return <img className={className} src={dataUrl} alt={alt} />;
}
