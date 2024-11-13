import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function NewProductForm({ onSubmit, product }) {
  const [productName, setProductName] = useState(product ? product.name : '')
  const [productPrice, setProductPrice] = useState(product ? product.price : '')
  const [productStockAmount, setProductStockAmount] = useState(product ? product.stock : '')
  const [productDescription, setProductDescription] = useState(product ? product.description : '')
  const [productImage, setProductImage] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState(product ? product.categories : [])

  const categories = ['health', 'electronics', 'fashion', 'beauty', 'sports', 'toys']

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setProductImage(file);  // Guarda el archivo en el estado
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const error = await onSubmit({
      productName,
      productPrice: parseFloat(productPrice),
      productStockAmount: parseInt(productStockAmount),
      productDescription,
      productCategories: selectedCategories
    }, productImage)
    if (error) {
        return
    }
    // Reset form
    setProductName('')
    setProductPrice('')
    setProductStockAmount('')
    setProductDescription('')
    setProductImage(null)
    setSelectedCategories([])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div>
        <Label htmlFor="productName">Product Name</Label>
        <Input
          id="productName"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="productPrice">Price</Label>
        <Input
          id="productPrice"
          type="number"
          step="0.01"
          value={productPrice}
          onChange={(e) => setProductPrice(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="productStockAmount">Stock Amount</Label>
        <Input
          id="productStockAmount"
          type="number"
          value={productStockAmount}
          onChange={(e) => setProductStockAmount(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="productDescription">Description</Label>
        <Textarea
          id="productDescription"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          required
        />
      </div>
      <div>
      <Label>Categories</Label>
        <div className="mt-2 space-y-2">
          {categories.map(category => (
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
      <div>
      <Label htmlFor="productImage">Product Image</Label>
        <Input
          id="productImage"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>
      <Button className="bg-green-800" type="submit">Confirm</Button>
    </form>
  )
}