import { Slider } from "@/components/common/slider/Slider";
import { useState, useRef, useEffect } from "react";

type TSliderInput = {
  value: number;
  name: string;
  error: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const SliderInput = ({ value, name, error, onChange }: TSliderInput) => {
  const [sliderValue, setSliderValue] = useState(value);
  const [inputValue, setInputValue] = useState(value.toString());
  const sliderRef = useRef<any>(null);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.value = inputValue;
      setSliderValue(Number(inputValue));
    }
  }, [inputValue]);

  useEffect(() => {
    setSliderValue(value);
    setInputValue(value.toString());
  }, [value]);

  return (
    <div className="flex flex-col">
      <div className="flex">
        <p className="text-xs mb-3 mt-2 xl:mb-0 font-semibold text-dark">{name}</p>
        <input
          type="number"
          value={inputValue}
          min={0}
          max={100}
          onChange={(e) => {
            let val = 0;
            if (Number(e.target.value) > 100) {
              val = 100;
            } else {
              val = Number(e.target.value);
            }

            setInputValue(val.toString());
            onChange({ target: { value: val } } as any);
          }}
          className="ml-auto w-8 h-5 mt-2 text-xs rounded-md border border-gray-400 text-gray-500 p-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        ></input>
      </div>
      <Slider
        ref={sliderRef}
        className="mb-auto mt-auto "
        value={[sliderValue]} // Add controlled value
        max={100}
        step={1}
        onValueChange={(e) => {
          setSliderValue(e[0]);
          setInputValue(e[0].toString());
          onChange({ target: { value: e[0] } } as any);
        }}
      />
      {error ? <p className="text-red-500">{error}</p> : <></>}
    </div>
  );
};

export default SliderInput;
