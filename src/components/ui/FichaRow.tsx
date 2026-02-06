"use client";

import Link from "next/link";
import { Eye, Edit3, Download } from "lucide-react";
import { Ficha } from "@/lib/data";
import { EstadoBadge } from "./EstadoBadge";

interface FichaRowProps {
  ficha: Ficha;
}

export function FichaRow({ ficha }: FichaRowProps) {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-all duration-200 group">
      <td className="py-4 px-4">
        <span className="font-mono text-xs text-gray-400 font-medium">{ficha.codigo}</span>
      </td>
      <td className="py-4 px-4">
        <div>
          <div className="font-semibold text-gray-900 text-sm">{ficha.articulo}</div>
          <div className="text-xs text-gray-400 mt-0.5">{ficha.familia}</div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="text-sm text-gray-600">{ficha.material}</div>
      </td>
      <td className="py-4 px-4">
        <div className="text-sm text-gray-600">{ficha.acabado}</div>
      </td>
      <td className="py-4 px-4">
        <EstadoBadge estado={ficha.estado} />
      </td>
      <td className="py-4 px-4">
        <span className="text-xs text-gray-400 font-medium">{ficha.fecha}</span>
      </td>
      <td className="py-4 px-4">
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <Link
            href={`/fichas/${ficha.id}`}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors duration-200"
          >
            <Eye size={15} strokeWidth={1.5} />
          </Link>
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors duration-200">
            <Edit3 size={15} strokeWidth={1.5} />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors duration-200">
            <Download size={15} strokeWidth={1.5} />
          </button>
        </div>
      </td>
    </tr>
  );
}
