import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react'
import ApiClient from "../api"
import { Trash2 } from 'lucide-react'
import { Label } from "@/components/ui/label"


export default function Item({ product, isAdmin, onDelete}) {
  const [quantity, setQuantity] = useState(1)
  const [booking, setBooking] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const { toast } = useToast()
  const apiClient = new ApiClient(toast)

  /*const handleBook = async () => {
    setBooking(true)
    // Simulate API call for booking
    setBooking(false)
    const result = await apiClient.bookProduct(product.id, product)
    if (result.error)
        return
    toast({
      title: "Booking Successful",
      description: `You have booked ${quantity} ${quantity > 1 ? 'units' : 'unit'} of ${product.name}`
    })
  }*/

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
        throw new Error(result.error.message || "An error occurred while booking the product.");
      }
  
      toast({
        title: "Booking Successful",
        description: `You have booked ${quantity} ${quantity > 1 ? 'units' : 'unit'} of ${product.name}`,
      });
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error.message,
        status: "error",
      });
    } finally {
      setBooking(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      // Here you would typically call an API to delete the product
      // For now, we'll just call the onDelete prop
      const result = await onDelete(product.id)
      if (result.error)
        return
      toast({
        title: "Product Deleted",
        description: `${product.name} has been deleted.`,
      })
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg bg-slate-700">
        
      <div className="relative h-48 w-full">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
        {isAdmin && (
        <Button
        //   variant="destructive"
          size="icon"
        //   className="absolute top-2 right-2 z-10 "
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete product</span>
        </Button>
      )}
        <p className="text-gray-300 mb-2">{product.description}</p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold">${product.price}</span>
          <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
          </span>
        </div>
        <div className="flex items-center space-x-2 mb-4">
          {showBookingForm ?  <></> : <Input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
            disabled={product.stock === 0}
            className="w-20"
          />}
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
        onConfirm={handleConfirmBooking} // Pass the booking handler
        maxQuantity={product.stock}
      /> */}
      
    </div>
  )
}