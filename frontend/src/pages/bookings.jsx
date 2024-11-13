import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ApiClient from "../api"
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

// // This is a mock API call. Replace it with your actual API call.
// async function getBookings() {
//   // Simulating an API call with a delay
//   await new Promise(resolve => setTimeout(resolve, 1000))
//   return [
//     { id: 1, productId: 1, userId: 101, quantity: 2, reservationDate: '2023-06-01', status: 'Confirmed' },
//     { id: 2, productId: 2, userId: 102, quantity: 1, reservationDate: '2023-06-02', status: 'Pending' },
//     { id: 3, productId: 3, userId: 103, quantity: 3, reservationDate: '2023-06-03', status: 'Cancelled' },
//   ];
// }

export default function AdminPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const {toast} = useToast()
  const apiClient = new ApiClient(toast)
  const [refresh, setRefresh] = useState(false)

  const handleCompleteBooking = async (bookingId) => {
    try {
      const result = await apiClient.completeBooking(bookingId)
      if (result.error) {
        return
      }
      setRefresh(!refresh)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      })
    }
  }


  useEffect(() => {
    async function fetchBookings() {
      try {
        const data = await apiClient.getBookings()
        if (data.error) {
            return
        }
        setBookings(data.data.bookings)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch bookings')
        setLoading(false)
      }
    }

    fetchBookings()
  }, [refresh])

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>
  if (error) return <div className="container mx-auto px-4 py-8">Error: {error}</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
              <TableHead className="w-[200px]">Product</TableHead>
                  <TableHead className="w-[100px] text-center">Quantity</TableHead>
                  <TableHead className="w-[150px] text-center">Date</TableHead>
                  <TableHead className="w-[100px] text-center">Time</TableHead>
                  <TableHead className="w-[100px] text-center">Status</TableHead>
                  <TableHead className="w-[150px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell classname="text-center">{booking.product_id}</TableCell>
                  <TableCell classname="text-center">{booking.quantity}</TableCell>
                  <TableCell classname="text-center">{booking.pickup_date}</TableCell>
                  <TableCell classname="text-center">{booking.pickup_hour}</TableCell>
                  <TableCell classname="text-center">{booking.status}</TableCell>
                  <TableCell classname="text-center">
                    {booking.status === 'PENDING' && (
                      <Button classname="bg-green-800 content-center" onClick={() => handleCompleteBooking(booking.id)}>
                        Confirm Delivery
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}