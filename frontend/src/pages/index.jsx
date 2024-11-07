import { useState, useEffect } from 'react'
import Item from '@components/Item'
import NewProductForm from '@components/NewProductForm'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast";
import ApiClient from "../api"
import { RefreshCcw } from 'lucide-react';

export default function HomePage({isLogged}) {
  const [products, setProducts] = useState([])
  const [refresh, setRefresh] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showNewProductForm, setShowNewProductForm] = useState(false)
  const { toast } = useToast()
  const apiClient = new ApiClient(toast)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await apiClient.getProducts()
        setProducts(data.data.products)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch products')
        setLoading(false)
      }
    }

    fetchProducts()
  }, [refresh])

  const handleDeleteProduct = async (id) => {
    // This is where you'd normally send the new product to your API
    // For now, we'll just add it to the local state
    const data = await apiClient.deleteProduct(id)
    if (data.error)
      return data
    setRefresh(!refresh)
    setShowNewProductForm(false)
    return data
  }

  const handleNewProduct = async (newProduct, productImage) => {
    // This is where you'd normally send the new product to your API
    // For now, we'll just add it to the local state
    const formData = new FormData();
    formData.append('image', productImage);
    const data = await apiClient.addProduct(newProduct)
    await apiClient.addImage(data.data.id, formData)
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
      <Button onClick={() => setShowNewProductForm(!showNewProductForm)} className="mb-6 bg-slate-700">
        {showNewProductForm ? 'Hide New Product Form' : 'Add New Product'}
      </Button>
      {showNewProductForm && <NewProductForm onSubmit={handleNewProduct} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <Item key={product.id} product={product} isAdmin={isLogged} onDelete={handleDeleteProduct} />
        ))}
      </div>
    </div>
  )
}