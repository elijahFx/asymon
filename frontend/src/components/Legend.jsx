const Legend = () => {
  const items = [
    { color: "bg-red-500", label: "Новое – путь для внесения предоплаты не направлен" },
    { color: "bg-orange-400", label: "Ждем предоплату – путь для внесения предоплаты направлен" },
    { color: "bg-[#3174AD]", label: "Предоплата внесена – деньги уплачены" },
  ];

  return (
    <div className="flex flex-col gap-2 p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold">Легенда</h3>
      <div className="flex flex-col gap-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className={`w-4 h-4 ${item.color}`}></div>
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Legend;
