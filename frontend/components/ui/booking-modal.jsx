import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog"; // Radix Dialog
import * as Select from "@radix-ui/react-select"; // Radix Select
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Assuming you use a Label component

// Helper function to format dates (YYYY-MM-DD)
const formatDate = (date) => date.toISOString().split("T")[0];

export default function BookingModal({ isOpen, onClose, onConfirm, maxQuantity }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("9");
  const [errorMessage, setErrorMessage] = useState(""); // Track error message

  const today = new Date();
  const oneMonthAhead = new Date(today);
  oneMonthAhead.setMonth(today.getMonth() + 1);

  const handleConfirm = () => {
    if (!selectedDate || !selectedHour) {
      // If date or hour is not selected, set the error message
      setErrorMessage("Please select both a date and an hour.");
    } else {
      // If valid, call the onConfirm function and close the modal
      onConfirm(selectedDate, selectedHour, quantity);
      onClose();
      setErrorMessage(""); // Reset error message on successful confirmation
    }
  };

  const hours = Array.from({ length: 9 }, (_, i) => 9 + i); // Hours from 9 to 17

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content
          className="fixed z-50 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl border p-6"
        >
          <Dialog.Title className="text-2xl font-bold my-4">Select Pickup Details</Dialog.Title>
          <div className="space-y-6 mt-4">
            {/* Row for Date, Hour, and Quantity */}
            <div className="grid grid-cols-3 gap-4">
              {/* Date Picker */}
              <div>
                <Label className="block text-sm font-medium mb-1">Date</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={formatDate(today)}
                  max={formatDate(oneMonthAhead)}
                  className="w-full"
                />
              </div>

              {/* Hour Picker */}
              <div>
                <Label className="block text-sm font-medium mb-1">Hour</Label>
                <Select.Root value={selectedHour} onValueChange={setSelectedHour}>
                  <Select.Trigger className="w-full p-2 border rounded border-gray-300 focus:border-slate-700 focus:ring-slate-700">
                    <Select.Value placeholder="Select Hour" />
                  </Select.Trigger>
                  <Select.Content className="bg-white shadow-lg rounded-md">
                    {hours.map((hour) => (
                      <Select.Item key={hour} value={String(hour)} className="p-2 cursor-pointer hover:bg-gray-100">
                        <Select.ItemText>{hour}:00</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>

              {/* Quantity Input */}
              <div>
                <Label className="block text-sm font-medium mb-1">Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))
                  }
                  className="w-full"
                />
              </div>
            </div>

            {/* Error message display */}
            {errorMessage && (
              <div className="text-red-500 text-sm mt-2">{errorMessage}</div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>Confirm Booking</Button>
            </div>

            {/* Info Note */}
            <p className="mt-4 text-xs text-gray-500">
              Please note: You can only book up to one month from today. Additionally, we will wait up to 3 hours from
              your selected pickup time. Keep in mind that our stores close at 18:00, so if you choose to pick up the
              product at 16:00 or 17:00, the waiting time will be shorter.
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
