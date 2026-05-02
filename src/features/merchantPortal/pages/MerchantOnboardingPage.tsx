import { useState, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notify } from "@/shared/lib/notify";
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
import { useMyApplications } from "../hooks/useMyApplications";
import { OnboardingSidebar } from "../../../shared/layouts/Merchants/OnboardingSidebar";
import { OnboardingTopbar } from "../../../shared/layouts/Merchants/OnboardingTopbar";
import { OnboardingStepper } from "../../../shared/layouts/Merchants/OnboardingStepper";

const DRAFT_KEY = "ugem_merchant_application_draft";

function getDraftValues(): Partial<OnboardingFormValues> {
  try {
    const rawDraft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");

    return {
      ...rawDraft,
      latitude:
        typeof rawDraft?.latitude === "number" &&
        Number.isFinite(rawDraft.latitude)
          ? rawDraft.latitude
          : 0,
      longitude:
        typeof rawDraft?.longitude === "number" &&
        Number.isFinite(rawDraft.longitude)
          ? rawDraft.longitude
          : 0,
    };
  } catch {
    return {};
  }
}

function getLatestApplication(
  applications: ReturnType<typeof useMyApplications>["data"],
) {
  if (!applications || applications.length === 0) return null;
  return [...applications].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  })[0];
}

// BlockedStateUI - shown when merchant is already approved
function BlockedStateUI({
  onNavigateToPortal,
}: Readonly<{
  onNavigateToPortal: () => void;
}>) {
  return (
    <main className="merchant-onboarding-layout">
      <OnboardingSidebar />

      <section className="onboarding-main">
        <OnboardingTopbar />

        <div className="onboarding-content">
          <div className="onboarding-form-area">
            <div className="onboarding-heading">
              <h1>Đăng ký đối tác mới</h1>
              <p>
                Bắt đầu hành trình đưa món ngon ẩn mình của bạn đến với mọi
                người.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>

              <h2 className="mb-3 text-2xl font-bold text-slate-900">
                Quán của bạn đã được duyệt
              </h2>

              <p className="mb-8 max-w-md text-slate-600">
                Hồ sơ quán của bạn đã được thẩm định và chấp thuận. Bạn không
                thể gửi hồ sơ mới. Vui lòng quay về Merchant Portal để quản lý
                quán.
              </p>

              <button
                type="button"
                onClick={onNavigateToPortal}
                className="next-button"
              >
                <Store size={18} />
                Quay về Merchant Portal
              </button>
            </div>
          </div>

          <PartnerBenefitCard />
        </div>
      </section>
    </main>
  );
}

export function MerchantOnboardingPage() {
  const navigate = useNavigate();
  const createMutation = useCreateApplication();
  const [currentStep, setCurrentStep] = useState(1);

  // Check if merchant already has an approved application
  const { data: applications = [], isLoading: isLoadingApps } =
    useMyApplications();

  const latestApplication = useMemo(
    () => getLatestApplication(applications),
    [applications],
  );

  const isApproved = latestApplication?.status === "Approved";
  const showBlockedUI = !isLoadingApps && isApproved;

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

  // Show blocked UI when already approved
  if (showBlockedUI) {
    return <BlockedStateUI onNavigateToPortal={() => navigate("/merchant")} />;
  }

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
    const descriptionLines = [
      values.description?.trim() || "",
      "",
      "--- Thông tin UI bổ sung ---",
      `Địa chỉ: ${values.address}`,
      `Loại hình quán: ${values.restaurantType}`,
      `Loại món chính: ${values.mainDishType}`,
      `Khoảng giá trung bình: ${values.priceRange}`,
    ];

    return descriptionLines
      .filter((line) => line !== undefined && line !== "")
      .join("\n")
      .trim();
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
          notify.success("Đã gửi hồ sơ quán thành công.");
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
