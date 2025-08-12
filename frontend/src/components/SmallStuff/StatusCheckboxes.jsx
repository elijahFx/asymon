const StatusCheckboxes = ({ status, onStatusChange }) => {
  const statuses = ["Новое", "Ждем предоплату", "Предоплата внесена"];
  
  const handleCheckboxChange = (selectedStatus) => {
    let newStatus;
    if (selectedStatus === "Новое") {
      newStatus = "Новое";
    } else if (selectedStatus === "Ждем предоплату") {
      newStatus = "Ждем предоплату";
    } else if (selectedStatus === "Предоплата внесена") {
      newStatus = "Предоплата внесена";
    }
    onStatusChange(newStatus);
  };

  const isChecked = (checkStatus) => {
    if (status === "Новое") return checkStatus === "Новое";
    if (status === "Ждем предоплату") return checkStatus === "Новое" || checkStatus === "Ждем предоплату";
    if (status === "Предоплата внесена") return true;
    return false;
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm text-center font-medium text-gray-700">Статус:</label>
      <div className="flex items-center space-x-4">
        {statuses.map((statusItem, index) => (
          <label key={statusItem} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isChecked(statusItem)}
              onChange={() => handleCheckboxChange(statusItem)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{statusItem}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default StatusCheckboxes