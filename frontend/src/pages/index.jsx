import { useState, useEffect } from 'react'
import Item from '@components/Item'
import NewProductForm from '@components/NewProductForm'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from '@/components/ui/checkbox'
import ApiClient from "../api"
import { Label } from '@/components/ui/label'


export default function HomePage({isLogged, isAdmin}) {
  const [products, setProducts] = useState([])
  const [refresh, setRefresh] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showNewProductForm, setShowNewProductForm] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState([])
  const { toast } = useToast()
  const apiClient = new ApiClient(toast)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await apiClient.getProducts()
        setLoading(false)
        if (data.error) {
          return
        }
        setProducts(data.data.products)
      } catch (err) {
        setError('Failed to fetch products')
        setLoading(false)
      }
    }

    fetchProducts()
  }, [refresh])

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const filteredProducts = products.filter(product => 
    selectedCategories.length === 0 || selectedCategories.every(cat => product.categories.includes(cat))
  )

  const handleDeleteProduct = async (id) => {
    const data = await apiClient.deleteProduct(id)
    if (data.error)
      return data
    setRefresh(!refresh)
    setShowNewProductForm(false)
    return data
  }

  const handleNewProduct = async (newProduct, productImage) => {
    const formData = new FormData()
    formData.append('image', productImage)
    const data = await apiClient.addProduct(newProduct)
    if (data.error) {
      return data.error
    }
    const data2 = await apiClient.addImage(data.data.id, formData)
    if (data2.error) {
      return data2.error
    }
    setRefresh(!refresh)
    toast({
      title: "Product Added",
      description: `${newProduct.productName} has been added to the product list.`,
    })    
    setShowNewProductForm(false)
    return data
  }

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>
  if (error) return <div className="container mx-auto px-4 py-8">Error: {error}</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      {isAdmin ? <Button onClick={() => setShowNewProductForm(!showNewProductForm)} className="mb-6 bg-slate-700">
        {showNewProductForm ? 'Hide New Product Form' : 'Add New Product'}
      </Button> : <></>}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4">
          {[... new Set(products.map(p => p.categories).flat())].map(category => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryChange(category)}
              />
              <Label htmlFor={`category-${category}`}>{category}</Label>
            </div>
          ))}
        </div>
      </div>
      {showNewProductForm && <NewProductForm image={true} onSubmit={handleNewProduct} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <Item
            key={product.id} 
            product={product} 
            isAdmin={isAdmin}
            onDelete={handleDeleteProduct}
            setRefresh={setRefresh}
          />
        ))}
      </div>
    </div>
  )
}