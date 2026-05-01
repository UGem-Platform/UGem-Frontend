import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BusinessInfoStep } from "../components/BusinessInfoStep";
import { AddressLocationStep } from "../components/AddressLocationStep";
import { MenuDetailsStep } from "../components/MenuDetailsStep";

import { PartnerBenefitCard } from "../components/PartnerBenefitCard";
import { ReviewSubmitStep } from "../components/ReviewSubmitStep";
import {
  onboardingSchema,
  type OnboardingFormValues,
  type OnboardingSchema,
} from "../schema";
import { useCreateApplication } from "../hooks/useCreateApplication";
import { OnboardingSidebar } from "../../../shared/layouts/Merchants/OnboardingSidebar";
import { OnboardingTopbar } from "../../../shared/layouts/Merchants/OnboardingTopbar";
import { OnboardingStepper } from "../../../shared/layouts/Merchants/OnboardingStepper";

const DRAFT_KEY = "ugem_merchant_application_draft";

function getDraftValues(): Partial<OnboardingFormValues> {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
  } catch {
    return {};
  }
}

export function MerchantOnboardingPage() {
  const navigate = useNavigate();
  const createMutation = useCreateApplication();
  const [currentStep, setCurrentStep] = useState(1);

  const methods = useForm<OnboardingFormValues, unknown, OnboardingSchema>({
    resolver: zodResolver(onboardingSchema),
    mode: "onSubmit",
    defaultValues: {
      restaurantName: "",
      email: "",
      phone: "",
      restaurantType: "",
      mainDishType: "",
      priceRange: "",
      address: "",
      latitude: 0,
      longitude: 0,
      logoUrl: "",
      menu: [
        {
          name: "",
          description: "",
          price: 0,
          imageUrl: "",
          imageUploadDataUrl: "",
          category: "",
        },
      ],
      ...getDraftValues(),
    },
  });

  const {
    register,
    control,
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { errors },
  } = methods;

  async function nextStep() {
    const fieldsByStep: Record<number, (keyof OnboardingFormValues)[]> = {
      1: [
        "restaurantName",
        "email",
        "phone",
        "restaurantType",
        "mainDishType",
        "priceRange",
      ],
      2: ["address", "latitude", "longitude"],
      3: ["menu"],
      4: [],
    };

    const valid = await trigger(fieldsByStep[currentStep]);

    if (!valid) return;

    setCurrentStep(Math.min(currentStep + 1, 4));
  }

  function previousStep() {
    setCurrentStep(Math.max(currentStep - 1, 1));
  }

  function buildDescription(values: OnboardingSchema) {
    return `

--- Thông tin UI bổ sung ---
Địa chỉ: ${values.address}
Loại hình quán: ${values.restaurantType}
Loại món chính: ${values.mainDishType}
Khoảng giá trung bình: ${values.priceRange}
`.trim();
  }

  async function onSubmit(values: OnboardingSchema) {
    // Validate that all prices are valid numbers
    const validMenu = values.menu.map((menuItem) => {
      const price = Number(menuItem.price);
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error("Giá món phải là số dương");
      }
      return {
        ...menuItem,
        price,
      };
    });

    createMutation.mutate(
      {
        name: values.restaurantName,
        email: values.email,
        description: buildDescription(values),
        phone: values.phone,
        logoUrl: values.logoUrl || "",
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
        menu: validMenu.map((menuItem) => {
          const { imageUploadDataUrl, ...rest } = menuItem;

          return {
            ...rest,
            imageUrl: imageUploadDataUrl?.trim() || rest.imageUrl,
          };
        }),
      },
      {
        onSuccess: () => {
          localStorage.removeItem(DRAFT_KEY);
          alert("Đã gửi hồ sơ quán thành công.");
          navigate("/merchant");
        },
      },
    );
  }

  return (
    <FormProvider {...methods}>
      <main className="merchant-onboarding-layout">
        <OnboardingSidebar />

        <section className="onboarding-main">
          <OnboardingTopbar />

          <form
            className="onboarding-content"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="onboarding-form-area">
              <OnboardingStepper currentStep={currentStep} />

              <div className="onboarding-heading">
                <h1>Đăng ký đối tác mới</h1>
                <p>
                  Bắt đầu hành trình đưa món ngon ẩn mình của bạn đến với mọi
                  người.
                </p>
              </div>

              {currentStep === 1 && (
                <BusinessInfoStep
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                />
              )}

              {currentStep === 2 && (
                <AddressLocationStep
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  watchedLat={watch("latitude")}
                  watchedLng={watch("longitude")}
                />
              )}

              {currentStep === 3 && (
                <MenuDetailsStep
                  control={control}
                  register={register}
                  errors={errors}
                  setValue={setValue}
                />
              )}

              {currentStep === 4 && <ReviewSubmitStep watch={watch} />}

              {createMutation.isError && (
                <p className="form-error">
                  {createMutation.error instanceof Error
                    ? createMutation.error.message
                    : "Gửi hồ sơ thất bại"}
                </p>
              )}

              <div className="onboarding-actions">
                <div>
                  {currentStep > 1 && (
                    <button
                      type="button"
                      className="back-button"
                      onClick={previousStep}
                    >
                      <ArrowLeft size={18} />
                      Quay lại
                    </button>
                  )}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      className="next-button"
                      onClick={nextStep}
                    >
                      Tiếp tục
                      <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="next-button"
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? "Đang gửi..." : "Gửi hồ sơ"}
                      <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <PartnerBenefitCard />
          </form>
        </section>
      </main>
    </FormProvider>
  );
}
