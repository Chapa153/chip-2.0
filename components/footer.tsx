"use client"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-slate-200 text-sm mt-auto border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          {/* Información institucional */}
          <div>
            <h4 className="font-semibold text-white mb-2">Contaduría General de la Nación</h4>
            <p className="text-xs mb-1">Cuentas Claras, Estado Transparente.</p>
            <p className="text-xs text-slate-400">Entidad adscrita al Ministerio de Hacienda y Crédito Público</p>
          </div>

          {/* Dirección */}
          <div>
            <h4 className="font-semibold text-white mb-2">Dirección</h4>
            <p className="text-xs">Calle 26 No 69 - 76</p>
            <p className="text-xs">Edificio Elemento Torre 1 (Aire) - Piso 15</p>
            <p className="text-xs">Bogotá D.C., Colombia</p>
            <p className="text-xs text-slate-400 mt-1">Código postal: 111071</p>
          </div>

          {/* Horario */}
          <div>
            <h4 className="font-semibold text-white mb-2">Horario de Atención</h4>
            <p className="text-xs">Lunes a viernes</p>
            <p className="text-xs">8:00 a.m. - 4:00 p.m.</p>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-slate-700 pt-4">
          <p className="text-center text-xs text-slate-400">
            © 2025 Contaduría General de la Nación. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
