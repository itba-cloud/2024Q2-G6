import React from "react";

const ActionButton = ({
  buttonText,
  buttonColor,
  hasInput,
  onButtonClick,
  placeholder,
  hasBorderRight,
  hasBorderLeft,
  inputValue,
  setInputValue,
  addResponse,
  getResponse,
  deleteResponse,
  isGetBooking,
  hasInputImage,
  setSelectedImage,
  isLogged
}) => {
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      onButtonClick();
    }
  };

  const handleInputChange = (event, k) => {
    setInputValue({
      ...inputValue,
      [k]: event.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);  // Guarda el archivo en el estado
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-start ${
        hasBorderRight ? "border-r-2 border-white" : ""
      } ${hasBorderLeft ? "border-l-2 border-white" : ""}`}
      style={{ width: "33.33vw", height: "100%" }}
    >
      {console.log(isLogged)}
      <button
        className={`font-bold py-2 px-4 rounded mt-4 ${!isLogged ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'text-white'}`}
        onClick={onButtonClick}
        style={{ backgroundColor: isLogged ? buttonColor : 'gray' }}
        disabled={!isLogged}
        title={!isLogged ? 'You must log in to perfom this action' : ''}
      >
        {buttonText}
      </button>
      {hasInput &&
        Object.keys(inputValue).map((k) => (
          <input
            key={k}
            className="mt-4 px-3 py-2 border border-gray-300 rounded-lg"
            type="text"
            placeholder={
              placeholder + " " + k.replace(/([A-Z])/g, " $1").toLowerCase()
            }
            value={inputValue[k]}
            onKeyDown={handleKeyDown}
            onChange={(e) => handleInputChange(e, k)}
          />
        ))}
        {hasInputImage && (
            <div className="mt-4 ml-6 mr-6">
                <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files[0])}
                className="px-3 py-2 border border-gray-300 rounded-lg max-w-md w-full"
                />
            </div>
        )}

      {addResponse && (
        <div className="mt-4 p-4 bg-gray-800 text-white border border-gray-600 rounded-lg w-11/12">
          <p className="text-lg font-semibold mb-2">Response:</p>
          <p>Status: {addResponse.message}</p>
        </div>
      )}

      {getResponse &&
        getResponse.length > 0 &&
        (isGetBooking
          ? getResponse.map((item) => (
              <div
                key={item.id}
                className="mt-4 p-4 bg-gray-800 text-white border border-gray-600 rounded-lg w-11/12"
              >
                <p className="text-lg font-semibold mb-2">Booking {item.id}:</p>

                <ul key={item.id}>
                  <li className="text-sm"> User ID: {item.user_id}</li>
                  <li className="text-sm"> Product Id: {item.product_id}</li>
                  <li className="text-sm"> Quantity: {item.quantity}</li>
                  <li className="text-sm">
                    {" "}
                    Reservation Date: {item.reservation_date}
                  </li>
                </ul>
              </div>
            ))
          : getResponse.map((item) => (
              <div
                key={item.id}
                className="mt-4 p-4 bg-gray-800 text-white border border-gray-600 rounded-lg w-11/12"
              >
                <p className="text-lg font-semibold mb-2">Item {item.id}:</p>

                <img
                  src={item.image_url}
                  alt={`Image of ${item.name}`}
                  className="w-full h-48 object-cover rounded-md mb-2"
                />

                <ul>
                  <li className="text-sm"> Title: {item.name}</li>
                  <li className="text-sm"> Price: {item.price}</li>
                  <li className="text-sm"> Stock: {item.stock}</li>
                  <li className="text-sm"> Description: {item.description}</li>
                
                </ul>
              </div>
            )))}

      {deleteResponse && deleteResponse.success && (
        <div className="mt-4 p-4 bg-gray-800 text-white border border-gray-600 rounded-lg w-11/12">
          <p className="text-lg font-semibold mb-2">Deleted Item:</p>
          <p>ID: {deleteResponse.id}</p>
        </div>
      )}
    </div>
  );
};

export default ActionButton;
