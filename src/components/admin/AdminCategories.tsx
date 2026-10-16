import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, FolderTree } from 'lucide-react';
import { Category } from '../../types';
import { StorageService } from '../../services/storage';

interface AdminCategoriesProps {
  categories: Category[];
  onRefresh: () => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  categories,
  onRefresh
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  const handleOpenAdd = () => {
    setEditingCategory({
      id: `cat-${Date.now()}`,
      name: '',
      nameFr: '',
      iconName: 'BookOpen',
      count: 0,
      description: ''
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory({ ...category });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      const updated = categories.filter(c => c.id !== id);
      StorageService.saveCategories(updated);
      onRefresh();
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name) return;

    const fullCat = editingCategory as Category;
    const exists = categories.some(c => c.id === fullCat.id);
    let updated: Category[];
    if (exists) {
      updated = categories.map(c => c.id === fullCat.id ? fullCat : c);
    } else {
      updated = [...categories, fullCat];
    }

    StorageService.saveCategories(updated);
    setIsEditing(false);
    setEditingCategory(null);
    onRefresh();
  };

  return (
    <div className="space-y-6 text-right">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="font-editorial text-2xl font-bold text-stone-900">
            إدارة الأقسام والتصنيفات (Book Categories)
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            تنظيم كتب دار رميسة بين روايات، فلسفة، دراسات نقدية، وتاريخ الجزائر
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-editorial font-bold text-lg">
                  ر
                </span>
                <span className="font-mono text-xs text-stone-400">
                  {cat.count} كتاب
                </span>
              </div>

              <h3 className="font-editorial text-lg font-bold text-stone-900">
                {cat.name}
              </h3>
              <span className="text-xs text-stone-400 font-mono block mb-2">
                {cat.nameFr}
              </span>
              <p className="text-xs text-stone-600 leading-relaxed">
                {cat.description}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100 mt-4">
              <button
                onClick={() => handleOpenEdit(cat)}
                className="p-1.5 text-stone-600 hover:text-amber-800 hover:bg-stone-100 rounded-lg transition-colors"
                title="تعديل"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditing && editingCategory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 p-6 text-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h3 className="font-editorial text-lg font-bold text-stone-900">
                {editingCategory.name ? 'تعديل القسم' : 'إضافة قسم جديد'}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-stone-400 hover:text-stone-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  اسم القسم بالعربية *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="مثال: روايات وأدب"
                  className="w-full p-2.5 rounded-lg border border-stone-300 font-editorial text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  الاسم بالفرنسية / اللاتينية
                </label>
                <input
                  type="text"
                  value={editingCategory.nameFr || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, nameFr: e.target.value })}
                  placeholder="Romans & Littérature"
                  className="w-full p-2.5 rounded-lg border border-stone-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  وصف تعريفي للقسم
                </label>
                <textarea
                  rows={2}
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl hover:bg-stone-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>حفظ القسم</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
