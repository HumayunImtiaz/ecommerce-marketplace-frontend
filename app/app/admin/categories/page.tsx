import CategoriesTable from "@/components/categories-table"

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground hidden sm:block">Manage your product categories and collections</p>
        </div>
      </div>
      <CategoriesTable />
    </div>
  )
}
