"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Link2, Loader2, Plus, Trash2, Eye, EyeOff,
  Star, Pencil, Check, X, Package
} from "lucide-react";

interface ParsedCard {
  name: string;
  setName?: string;
  setCode?: string;
  number?: string;
  rarity?: string;
  types?: string[];
  hp?: string;
  imageUrl: string;
  imageLarge?: string;
  description?: string;
  artist?: string;
  tcgId?: string;
  sourceUrl: string;
}

interface Card {
  id: string;
  name: string;
  setName?: string | null;
  rarity?: string | null;
  types?: string | null;
  imageUrl: string;
  price: number;
  stock: number;
  published: boolean;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  Fire: "bg-red-500",
  Water: "bg-blue-500",
  Grass: "bg-green-500",
  Electric: "bg-yellow-400",
  Psychic: "bg-purple-500",
  Fighting: "bg-orange-600",
  Darkness: "bg-gray-800",
  Metal: "bg-gray-400",
  Dragon: "bg-indigo-600",
  Colorless: "bg-gray-300",
  Fairy: "bg-pink-400",
};

export default function AdminPage() {
  const [url, setUrl] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [preview, setPreview] = useState<ParsedCard | null>(null);
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [saving, setSaving] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadCards = () => {
    setLoadingCards(true);
    fetch("/api/admin/cards")
      .then((r) => r.json())
      .then(setCards)
      .finally(() => setLoadingCards(false));
  };

  useEffect(() => { loadCards(); }, []);

  const handleParseUrl = async () => {
    if (!url.trim()) return;
    setParsing(true);
    setParseError("");
    setPreview(null);
    try {
      const res = await fetch("/api/parse-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview(data);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to parse");
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    if (!preview || !price) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...preview, price, stock }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setPreview(null);
      setUrl("");
      setPrice("");
      setStock("10");
      setSuccessMsg(`"${preview.name}" added to shop!`);
      setTimeout(() => setSuccessMsg(""), 3000);
      loadCards();
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (card: Card) => {
    await fetch(`/api/admin/cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !card.published }),
    });
    loadCards();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this card from the shop?")) return;
    await fetch(`/api/admin/cards/${id}`, { method: "DELETE" });
    loadCards();
  };

  const handleSaveEdit = async (id: string) => {
    await fetch(`/api/admin/cards/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: editPrice, stock: editStock }),
    });
    setEditingId(null);
    loadCards();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Package className="w-7 h-7 text-red-600" />
        <h1 className="text-3xl font-black text-gray-900">Admin Panel</h1>
      </div>

      {/* Add Card Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-red-600" /> Add New Card
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Paste any Pokemon card URL — from TCGPlayer, Bulbapedia, or the Pokemon TCG API. Card info will be fetched automatically.
        </p>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleParseUrl()}
              placeholder="https://www.tcgplayer.com/product/... or https://bulbapedia.bulbagarden.net/wiki/..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>
          <button
            onClick={handleParseUrl}
            disabled={parsing || !url.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
            {parsing ? "Parsing..." : "Parse Link"}
          </button>
        </div>

        {parseError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
            {parseError}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
            <Check className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* Card Preview */}
        {preview && (
          <div className="border border-gray-200 rounded-2xl p-5 mt-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Card Preview</h3>
            <div className="flex gap-6">
              <div className="relative w-36 h-48 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                <Image
                  src={preview.imageLarge || preview.imageUrl}
                  alt={preview.name}
                  fill
                  className="object-contain p-2"
                  sizes="160px"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-black text-gray-900 mb-1">{preview.name}</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {preview.types?.map((t) => (
                    <span key={t} className={`text-xs text-white font-bold px-2.5 py-0.5 rounded-full ${TYPE_COLORS[t] || "bg-gray-400"}`}>
                      {t}
                    </span>
                  ))}
                  {preview.rarity && (
                    <span className="flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 px-2.5 py-0.5 rounded-full font-medium">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {preview.rarity}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 space-y-0.5 mb-4">
                  {preview.setName && <p><span className="font-medium">Set:</span> {preview.setName}</p>}
                  {preview.number && <p><span className="font-medium">Number:</span> #{preview.number}</p>}
                  {preview.hp && <p><span className="font-medium">HP:</span> {preview.hp}</p>}
                  {preview.artist && <p><span className="font-medium">Artist:</span> {preview.artist}</p>}
                </div>

                {preview.description && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4 max-h-28 overflow-y-auto">
                    {preview.description.split("\n").map((line, i) => (
                      <p key={i} className="text-xs text-gray-600">{line}</p>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Price (€) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="9.99"
                      className="w-28 px-3 py-2 border-2 border-red-300 rounded-xl focus:outline-none focus:border-red-500 text-sm font-bold"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Stock</label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving || !price}
                    className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {saving ? "Saving..." : "Add to Shop"}
                  </button>
                  <button
                    onClick={() => setPreview(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cards List */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Shop Cards ({cards.length})
        </h2>
        {loadingCards ? (
          <div className="text-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
          </div>
        ) : cards.length === 0 ? (
          <p className="text-gray-400 text-center py-10">No cards yet. Add one above!</p>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => {
              const types: string[] = card.types ? JSON.parse(card.types) : [];
              const isEditing = editingId === card.id;

              return (
                <div
                  key={card.id}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${card.published ? "border-gray-100 bg-gray-50" : "border-gray-200 bg-gray-100 opacity-60"}`}
                >
                  <div className="relative w-10 h-14 flex-shrink-0">
                    <Image src={card.imageUrl} alt={card.name} fill className="object-contain" sizes="40px" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">{card.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {card.setName && <span className="text-xs text-gray-400 truncate">{card.setName}</span>}
                      {types[0] && (
                        <span className={`text-xs text-white font-bold px-2 py-0 rounded-full ${TYPE_COLORS[types[0]] || "bg-gray-400"}`}>
                          {types[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-24 px-2 py-1 border-2 border-red-400 rounded-lg text-sm font-bold"
                        placeholder="Price"
                      />
                      <input
                        type="number"
                        value={editStock}
                        onChange={(e) => setEditStock(e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-sm"
                        placeholder="Stock"
                      />
                      <button
                        onClick={() => handleSaveEdit(card.id)}
                        className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-sm text-gray-900">€{card.price.toFixed(2)}</p>
                        <p className="text-xs text-gray-400">stock: {card.stock}</p>
                      </div>
                      <button
                        onClick={() => {
                          setEditingId(card.id);
                          setEditPrice(card.price.toString());
                          setEditStock(card.stock.toString());
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit price/stock"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTogglePublish(card)}
                        className={`p-1.5 rounded-lg transition-colors ${card.published ? "text-green-600 hover:text-gray-400" : "text-gray-400 hover:text-green-600"}`}
                        title={card.published ? "Hide from shop" : "Show in shop"}
                      >
                        {card.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                        title="Delete card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
