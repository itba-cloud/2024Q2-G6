import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from 'react'
import ApiClient from "../api"
import { Trash2, Edit, Image as ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label"
import NewProductForm from "./NewProductForm";
import { Badge } from "@/components/ui/badge"


export default function Item({ product, isAdmin, onDelete, setRefresh}) {
  const [quantity, setQuantity] = useState(1)
  const [booking, setBooking] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [isEditingContent, setIsEditingContent] = useState(false);
  const { toast } = useToast()
  const apiClient = new ApiClient(toast)
 

  const handleBook = () => {
    setShowModal(true)
  }
  
  const handleConfirmBooking = async (e) => {
    e.preventDefault()
    setBooking(true);
  
    try {
      const result = await apiClient.bookProduct(product.id, {
        quantity: quantity,
        date: bookingDate,
        time: bookingTime,
      });

      if (result.error) {
        return
      }

    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error.message,
        status: "error",
      });
    } finally {
      setShowBookingForm(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      const result = await onDelete(product.id);
      if (result.error) return;
    }
  };


  const handleEditContent = async (p) => {
    setIsEditingContent((v) => !v);
    // Placeholder for content edit functionality

  };

  const onSubmitEdit = async (p, image) => {
    const prod = {
        productName: p.productName,
        productPrice: p.productPrice,
        productStockAmount: p.productStockAmount,
        productDescription: p.productDescription,
        productCategories: p.productCategories
    }
    const resp = await apiClient.updateProduct(prod, product.id)

    if (resp.error) {
        return
    }

    if (image) {
        const formData = new FormData()
        formData.append('image', image)
        await apiClient.addImage(product.id, formData)
    }
    setIsEditingContent(false);
    setRefresh(r => !r)
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg bg-slate-700 relative">
      <div className="relative h-48 w-full">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          style={{ objectFit: "cover" }}
        />
        {isAdmin && (
          <div className="absolute top-2 right-2 z-10 flex space-x-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={handleEditContent}
            //   disabled={isEditingContent}
              aria-label="Edit content"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              onClick={handleDelete}
              aria-label="Delete product"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
        <p className="text-gray-300 mb-2">{product.description}</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {(product.categories).map((category, index) => (
            <Badge className="p-1 rounded-full bg-slate-200 text-gray-800" key={index}>{category}</Badge>
          ))}
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold">${product.price}</span>
          <span
            className={`text-sm ${
              product.stock > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {product.stock > 0 ? `In Stock: ${product.stock}` : "Out of Stock"}
          </span>
        </div>
        <div className="flex items-center space-x-2 mb-4">
          {/* <Button 
            className="flex-grow bg-black" 
            disabled={product.stock === 0 || booking}
            onClick={handleBook}
          >
            {booking ? 'Booking...' : (product.stock > 0 ? 'Book Now' : 'Out of Stock')}
          </Button> */}
{!showBookingForm ? (
          <Button 
            className="w-full bg-black" 
            disabled={product.stock === 0}
            onClick={() => setShowBookingForm(true)}
          >
            {product.stock > 0 ? 'Book Now' : 'Out of Stock'}
          </Button>
        ) : (
          <form onSubmit={handleBook} className="space-y-4 flex-grow">
            <div>
              <Label htmlFor={`quantity-${product.id}`}>Quantity</Label>
              <Input
                id={`quantity-${product.id}`}
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                min="1"
                max={product.stock}
                required
              />
            </div>
            <div>
              <Label htmlFor={`bookingDate-${product.id}`}>Date</Label>
              <Input
                id={`bookingDate-${product.id}`}
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor={`bookingTime-${product.id}`}>Time</Label>
              <Input
                id={`bookingTime-${product.id}`}
                type="time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                required
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleConfirmBooking} type="submit" variant="outline" className={"flex-1 bg-green-900 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-primary disabled:text-white"} disabled={!bookingDate || !bookingTime}>Confirm Booking</Button>
              <Button type="button" variant="outline" onClick={() => setShowBookingForm(false)} className="flex-1 bg-slate-600">Cancel</Button>
            </div>
          </form>
        )}
        </div>
      </div>
      {/* <BookingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmBooking}
        maxQuantity={product.stock}
      /> */}
      {isEditingContent ? <div className="p-3">
        <NewProductForm product={product} onSubmit={onSubmitEdit}></NewProductForm>
      </div> : <></>}
    </div>
  );
}