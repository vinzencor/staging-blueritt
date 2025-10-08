import React, {
  SVGProps,
  ComponentType,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { Icon } from "@iconify-icon/react";
import { cn } from "@/utils/cn";
import "./Stepper.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
type IStep = {
  name: string;
  icon?: string;
};

type IStepperProps = {
  steps?: IStep[];
  currentStep: number;
  className?: string;
};

const defaultSteps: IStep[] = [
  {
    name: "IntelliScan",
    icon: "1",
  },
  {
    name: "SourceLink",
    icon: "2",
  },
  {
    name: "MarginMax",
    icon: "3",
  },
  {
    name: "ProductVault",
    icon: "4",
  },
];

const Stepper: React.FC<IStepperProps> = ({
  steps,
  currentStep,
  className,
}) => {
  const [stepsInternal, setStepsInternal] = useState<IStep[]>(
    steps || defaultSteps
  );
  const [currentStepInternal, setCurrentStepInternal] = useState<number>(
    currentStep - 1
  );
  const scannerActiveComponent = useSelector(
    (state: any) => state.scannerActiveComponent
  );
  const scannerProductDetails = useSelector(
    (state: any) => state.scannerProductDetails
  );
  const scannerSelectedSupplier = useSelector(
    (state: any) => state.scannerSelectedSupplier
  );
  const profitProSource = useSelector(
    (state: any) => state.profitProSource
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleBack = () => {
    if (scannerActiveComponent === "Connect") {
      dispatch({
        type: "SET_SCANNER_ACTIVE_COMPONENT",
        payload: "ProductScanner",
      });
    }
    if (scannerActiveComponent === "ProfitCalculator" && profitProSource !== 'history') {
      dispatch({
        type: "SET_SCANNER_ACTIVE_COMPONENT",
        payload: "Connect",
      });
    }
    if (profitProSource === 'history') {
      navigate(-1);
    }
  };
  const handleNext = () => {
    if (
      scannerActiveComponent === "ProductScanner" &&
      Object.keys(scannerProductDetails).length > 0
    ) {
      dispatch({
        type: "SET_SCANNER_ACTIVE_COMPONENT",
        payload: "Connect",
      })      
    }
    if (
      scannerActiveComponent === "Connect" &&
      Object.keys(scannerSelectedSupplier).length > 0
    ) {
      dispatch({
        type: "SET_SCANNER_ACTIVE_COMPONENT",
        payload: "ProfitCalculator",
      });
    }
  };

  const showNextButton =
    (scannerActiveComponent === "ProductScanner" &&
      Object.keys(scannerProductDetails).length > 0) ||
    (scannerActiveComponent === "Connect" &&
      Object.keys(scannerSelectedSupplier).length > 0) 
  useEffect(() => {
    if (currentStep >= stepsInternal.length) {
      setCurrentStepInternal(stepsInternal.length - 1);
    } else {
      setCurrentStepInternal(currentStep - 1);
    }
  }, [currentStep]);

  useEffect(() => {
    setStepsInternal(steps || defaultSteps);
  }, [steps]);

  return (
    <div>
      {/* {currentStepInternal > 0 && (
        <span className="pt-2 text-primary cursor-pointer">Back</span>
      )}
      <div className={cn("flex w-3/4 mt-5 justify-between", className)}>
        {stepsInternal.map((step, i) => (
          <div
            key={i}
            className={`step-item ${i <= currentStepInternal && "active"}`}
          >
            <div className="flex justify-center font-semibold items-center gap-x-2">
              <div className="step">{step.icon ? <>{step.icon}</> : i + 1}</div>
              <span
                className={`${
                  i <= currentStepInternal ? "text-primary" : "text-black"
                }`}
              >
                {step.name}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="pt-2 text-primary cursor-pointer">Next</p> */}
      <div className="flex justify-between  w-full md:flex-row flex-col lg:flex-row">
        <div className="w-4/5">
          <ul className="relative lg:flex flex-row gap-x-2 sm:space-y-0 space-y-4 w-full mx-auto">
            {stepsInternal.map((step, i) => (
              <li
                className={`flex items-center gap-x-2 shrink basis-0 ${
                  i < stepsInternal.length - 1 ? "flex-1" : ""
                } group active`}
                data-hs-stepper-nav-item='\{"index": 1\}'
              >
                <span className="min-w-7 min-h-7 group inline-flex items-center text-base align-middle">
                  <span
                    className={
                      "size-9 flex justify-center items-center flex-shrink-0 bg-gray-300 dark:text-black font-medium text-gray-800 rounded-full group-focus:bg-gray-200 dark:bg-gray-300 dark:group-focus:bg-gray-600 hs-stepper-success:!bg-primary hs-stepper-success:!text-white hs-stepper-completed:!bg-success hs-stepper-completed:group-focus:!bg-success" +
                      (i <= currentStepInternal
                        ? " !bg-primary !text-white"
                        : "")
                    }
                  >
                    <span className="hs-stepper-success:hidden hs-stepper-completed:hidden">
                      {step.icon ? <>{step.icon}</> : i + 1}
                    </span>
                    <svg
                      className="hidden flex-shrink-0 size-3 hs-stepper-success:block"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <span
                    className={
                      "ms-2 text-base font-medium  text-gray-800 dark:text-white hs-stepper-success:!text-primary hs-stepper-completed:!text-success " +
                      (i <= currentStepInternal 
                        ? "hs-stepper-active:!text-primary black:hs-stepper-active:!text-primary" 
                        : "")
                      
                    }
                  >
                    {step.name}
                  </span>
                </span>
                {i < stepsInternal.length - 1 && (
                  <div className="hidden sm:block w-full h-px flex-1 bg-gray-200 dark:bg-bodybg group-last:hidden hs-stepper-success:!bg-primary hs-stepper-completed:!bg-success"></div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="w-full mt-5 flex justify-between">
        <div className="w-20">
          {currentStepInternal > 0 && (
            <span
              onClick={handleBack}
              className="flex items-center gap-x-2 justify-center text-white px-4 py-2 rounded-full bg-primary cursor-pointer"
            >
              {currentStepInternal > 0 && (
                <>
                  <i className="las la-angle-left"></i>Back
                </>
              )}
            </span>
          )}
        </div>
        <div className="w-20">
          {showNextButton && (
            <span
              className="flex items-center gap-x-2 justify-center text-white px-4 py-2 rounded-full bg-primary cursor-pointer mb-4"
              onClick={handleNext}
            >
              Next
              <i className="las la-angle-right"></i>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stepper;
