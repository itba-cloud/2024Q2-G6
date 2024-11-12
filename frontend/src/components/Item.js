import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef } from "react";
import ApiClient from "../api";
import { Trash2, Edit, Image as ImageIcon } from "lucide-react";
import BookingModal from "@/components/ui/booking-modal";

export default function Item({ product, isAdmin, onDelete, onUpdateImage }) {
  const [quantity, setQuantity] = useState(1);
  const [booking, setBooking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const { toast } = useToast();
  const apiClient = new ApiClient(toast);
  const fileInputRef = useRef(null);

  const handleBook = () => {
    setShowModal(true);
  };

  const handleConfirmBooking = async (
    selectedDate,
    selectedTime,
    selectedQuantity
  ) => {
    setBooking(true);
    setShowModal(false);

    try {
      const result = await apiClient.bookProduct(product.id, {
        quantity: selectedQuantity,
        date: selectedDate,
        time: selectedTime,
      });

      if (result.error) {
        throw new Error(
          result.error.message || "An error occurred while booking the product."
        );
      }

      toast({
        title: "Booking Successful",
        description: `You have booked ${selectedQuantity} ${
          selectedQuantity > 1 ? "units" : "unit"
        } of ${product.name}`,
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
      const result = await onDelete(product.id);
      if (result.error) return;
      toast({
        title: "Product Deleted",
        description: `${product.name} has been deleted.`,
      });
    }
  };

  const handleEditImage = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsEditingImage(true);
      try {
        const formData = new FormData();
        formData.append('image', file, file.name); // Add file.name as the third argument
        console.log('FormData contents:', formData); // Log FormData contents
        const result = await onUpdateImage(product.id, formData);
        if (result.error) {
          throw new Error(
            result.error || "An error occurred while updating the image."
          );
        }
        toast({
          title: "Image Updated",
          description: "The product image has been successfully updated.",
        });
      } catch (error) {
        console.error('Error updating image:', error); // Log the full error
        toast({
          title: "Image Update Failed",
          description: error.message,
          status: "error",
        });
      } finally {
        setIsEditingImage(false);
      }
    }
  };

  const handleEditContent = async () => {
    setIsEditingContent(true);
    // Placeholder for content edit functionality
    toast({
      title: "Edit Content",
      description: "Content edit functionality to be implemented.",
    });
    setIsEditingContent(false);
  };

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
              onClick={handleEditImage}
              disabled={isEditingImage}
              aria-label="Edit image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={handleEditContent}
              disabled={isEditingContent}
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
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-label="Upload new product image"
      />
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
        <p className="text-gray-300 mb-2">{product.description}</p>
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
          <Input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) =>
              setQuantity(
                Math.max(
                  1,
                  Math.min(product.stock, parseInt(e.target.value) || 1)
                )
              )
            }
            disabled={product.stock === 0}
            className="w-20"
          />
          <Button
            className="flex-grow bg-black"
            disabled={product.stock === 0 || booking}
            onClick={handleBook}
          >
            {booking
              ? "Booking..."
              : product.stock > 0
              ? "Book Now"
              : "Out of Stock"}
          </Button>
        </div>
      </div>
      <BookingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmBooking}
        maxQuantity={product.stock}
      />
    </div>
  );
}