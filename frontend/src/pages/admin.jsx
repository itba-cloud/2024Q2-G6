import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ApiClient from "../api"
import { useToast } from '@/hooks/use-toast';


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


  useEffect(() => {
    async function fetchBookings() {
      try {
        const data = await apiClient.getBookings()
        setBookings(data.data.boookings)
        setLoading(false)
      } catch (err) {
        setError('Failed to fetch bookings')
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>
  if (error) return <div className="container mx-auto px-4 py-8">Error: {error}</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">All Bookings</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking ID</TableHead>
            <TableHead>Product ID</TableHead>
            <TableHead>User ID</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Reservation Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>{booking.id}</TableCell>
              <TableCell>{booking.productId}</TableCell>
              <TableCell>{booking.userId}</TableCell>
              <TableCell>{booking.quantity}</TableCell>
              <TableCell>{booking.reservationDate}</TableCell>
              <TableCell>{booking.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}