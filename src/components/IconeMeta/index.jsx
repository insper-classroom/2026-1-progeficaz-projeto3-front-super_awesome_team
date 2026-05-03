// Icone visual da meta: traduz as metas conhecidas do mockup para icones vetoriais.
import {
  FiBookOpen,
  FiGlobe,
  FiHeart,
  FiHome,
  FiSend,
  FiShield,
  FiSmartphone,
  FiTarget,
  FiTool,
  FiTruck,
} from 'react-icons/fi'
import { PiArmchair } from 'react-icons/pi'

function normalizarTexto(texto = '') {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export default function IconeMeta({ meta }) {
  let nomeMeta = normalizarTexto(meta?.nome)
  if (meta?.icone) {
    nomeMeta = normalizarTexto(meta.icone)
  }

  // Centraliza a escolha para todos os cards exibirem os mesmos icones.
  if (nomeMeta.includes('entrada') || nomeMeta.includes('casa') || nomeMeta.includes('ape')) {
    return <FiHome aria-hidden="true" />
  }

  if (nomeMeta.includes('viagem')) {
    return <FiSend aria-hidden="true" />
  }

  if (nomeMeta.includes('reserva')) {
    return <FiShield aria-hidden="true" />
  }

  if (nomeMeta.includes('moveis')) {
    return <PiArmchair aria-hidden="true" />
  }

  if (nomeMeta.includes('reforma')) {
    return <FiTool aria-hidden="true" />
  }

  if (nomeMeta.includes('estudo')) {
    return <FiBookOpen aria-hidden="true" />
  }

  if (nomeMeta.includes('carro')) {
    return <FiTruck aria-hidden="true" />
  }

  if (nomeMeta.includes('casamento')) {
    return <FiHeart aria-hidden="true" />
  }

  if (nomeMeta.includes('celular')) {
    return <FiSmartphone aria-hidden="true" />
  }

  if (nomeMeta.includes('mundo')) {
    return <FiGlobe aria-hidden="true" />
  }

  return <FiTarget aria-hidden="true" />
}
