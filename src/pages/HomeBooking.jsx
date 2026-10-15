import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import PlaceholderImage from "@/components/PlaceholderImage";

import {
  createHomeAppointment,
  getHomeServiceTypes,
} from "@/services/homeapp";

/* =========================================================
   INITIAL FORM
========================================================= */

const initialForm = {
  fullName: "",
  phone: "",
  address: "",
  serviceType: "",
  caseDescription: "",
};

/* =========================================================
   MAIN
========================================================= */

export default function HomeBooking() {
  const [
    form,
    setForm,
  ] = useState(
    initialForm
  );

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    submitState,
    setSubmitState,
  ] = useState({
    type: "",
    message: "",
  });

  const [
    serviceTypes,
    setServiceTypes,
  ] = useState([]);

  const [
    loadingServices,
    setLoadingServices,
  ] = useState(true);

  const [
    servicesError,
    setServicesError,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  /* =======================================================
     LOAD SERVICE TYPES
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;

    const loadServiceTypes =
      async () => {
        try {
          setLoadingServices(
            true
          );

          setServicesError(
            ""
          );

          const data =
            await getHomeServiceTypes();

          if (
            cancelled
          ) {
            return;
          }

          setServiceTypes(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (error) {
          console.error(
            "HOME SERVICE TYPES ERROR:",
            error
          );

          if (
            !cancelled
          ) {
            setServiceTypes(
              []
            );

            setServicesError(
              "تعذر تحميل أنواع الخدمات حالياً."
            );
          }
        } finally {
          if (
            !cancelled
          ) {
            setLoadingServices(
              false
            );
          }
        }
      };

    loadServiceTypes();

    return () => {
      cancelled =
        true;
    };
  }, []);

  /* =======================================================
     SERVICES LIST FOR TOP SECTION
  ======================================================= */

  const servicesList =
    useMemo(() => {
      return serviceTypes.map(
        (service) =>
          service.label ||
          service.name
      );
    }, [
      serviceTypes,
    ]);

  /* =======================================================
     CHANGE
  ======================================================= */

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );

    setErrors(
      (prev) => ({
        ...prev,
        [name]: "",
      })
    );

    if (
      submitState.type
    ) {
      setSubmitState({
        type: "",
        message: "",
      });
    }
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm =
    () => {
      const nextErrors =
        {};

      if (
        !form.fullName.trim()
      ) {
        nextErrors.fullName =
          "يرجى إدخال الاسم بالكامل.";
      }

      if (
        !form.phone.trim()
      ) {
        nextErrors.phone =
          "يرجى إدخال رقم الهاتف.";
      }

      if (
        !form.address.trim()
      ) {
        nextErrors.address =
          "يرجى إدخال عنوانك.";
      }

      if (
        !form.serviceType
      ) {
        nextErrors.serviceType =
          "يرجى اختيار نوع الخدمة.";
      }

      if (
        !form.caseDescription.trim()
      ) {
        nextErrors.caseDescription =
          "يرجى تقديم وصف مختصر للحالة.";
      }

      setErrors(
        nextErrors
      );

      return (
        Object.keys(
          nextErrors
        ).length === 0
      );
    };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      if (
        !validateForm()
      ) {
        setSubmitState({
          type: "error",
          message:
            "يرجى إكمال جميع الحقول المطلوبة.",
        });

        return;
      }

      try {
        setSubmitting(
          true
        );

        setSubmitState({
          type: "",
          message: "",
        });

        await createHomeAppointment(
          {
            patientName:
              form.fullName.trim(),

            patientPhone:
              form.phone.trim(),

            address:
              form.address.trim(),

            serviceType:
              Number(
                form.serviceType
              ),

            caseDescription:
              form.caseDescription.trim(),
          }
        );

        setSubmitState({
          type: "success",
          message:
            "تم إرسال الطلب بنجاح. سيتم التواصل معك من فريق المستشفى لتأكيد الموعد.",
        });

        setForm(
          initialForm
        );

        setErrors(
          {}
        );
      } catch (error) {
        console.error(
          "CREATE HOME APPOINTMENT ERROR:",
          error
        );

        setSubmitState({
          type: "error",
          message:
            error?.response?.data?.message ||
            "تعذر إرسال الطلب حالياً. يرجى المحاولة مرة أخرى.",
        });
      } finally {
        setSubmitting(
          false
        );
      }
    };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#FAF6F6]">

      <div className="container-custom max-w-6xl">

        {/* =================================================
            INTRO
        ================================================== */}

        <section className="pt-6 md:pt-8">

          <div className="grid items-center gap-8 md:grid-cols-2">

            <Reveal>

              <div className="space-y-5">

                <span
                  className="
                    inline-flex
                    items-center
                    rounded-full
                    border
                    border-primary-100
                    bg-primary-50
                    px-4
                    py-2
                    text-sm
                    font-bold
                    text-primary-700
                  "
                >
                  خدمة المنزل
                </span>

                <h1
                  className="
                    text-3xl
                    font-extrabold
                    text-slate-800
                    md:text-4xl
                  "
                >
                  الحجز المنزلي
                </h1>

                <p
                  className="
                    text-lg
                    leading-8
                    text-slate-600
                  "
                >
                  نقدم لك الرعاية الطبية في منزلك بكل أمان وراحة،
                  حيث نرسل فريقاً طبياً أو أخصائياً إلى منزلك
                  لتقديم الخدمة التي تحتاجها سواء كانت زيارة طبية،
                  متابعة حالة، أو خدمة طوارئ منزلية.
                </p>

                <div className="space-y-3">

                  <h2
                    className="
                      text-lg
                      font-extrabold
                      text-primary-700
                    "
                  >
                    خدماتنا تشمل:
                  </h2>

                  {loadingServices ? (

                    <div className="flex items-center gap-2 text-sm text-slate-500">

                      <Loader2 className="w-4 h-4 animate-spin" />

                      جاري تحميل الخدمات...

                    </div>

                  ) : servicesList.length > 0 ? (

                    <div className="flex flex-wrap gap-2">

                      {servicesList.map(
                        (
                          item,
                          index
                        ) => (
                          <span
                            key={`${item}-${index}`}
                            className="
                              inline-flex
                              items-center
                              rounded-full
                              border
                              border-[#E7E3E3]
                              bg-white
                              px-3
                              py-2
                              text-sm
                              font-bold
                              text-slate-700
                              shadow-sm
                            "
                          >
                            {item}
                          </span>
                        )
                      )}

                    </div>

                  ) : null}

                </div>

                <a
                  href="#home-booking-form"
                  className="
                    btn
                    btn-accent
                    mt-2
                    shadow-[0_12px_25px_rgba(149,50,56,0.2)]
                    hover:-translate-y-0.5
                  "
                >
                  احجز الآن

                  <ArrowLeft className="h-4 w-4" />
                </a>

              </div>

            </Reveal>
<Reveal delay={100}>
  <div
    className="
      w-full
      rounded-[24px]
      border
      border-[#E7E3E3]
      bg-white
      p-2
      sm:p-3
      shadow-[0_20px_45px_rgba(25,119,134,0.08)]
    "
  >
    <div
      className="
        w-full
        overflow-hidden
        rounded-[18px]
        sm:rounded-[22px]
        bg-white
      "
    >
      <PlaceholderImage
        type="department"
        src="/images/ChatGPT Image Aug 16, 2026, 04_31_45 AM.webp"
        alt="خدمة الرعاية المنزلية"
        className="
          block
          w-full
          h-auto
          object-contain
        "
        rounded="rounded-[18px] sm:rounded-[22px]"
      />
    </div>
  </div>
</Reveal>

          </div>

        </section>

        {/* =================================================
            FORM
        ================================================== */}

        <section
          id="home-booking-form"
          className="mt-14 md:mt-16"
        >

          <Reveal>

            <SectionHeading
              badge="الحجز المنزلي"
              title="طلب الحجز المنزلي"
              subtitle="املأ البيانات التالية وسيتواصل معك فريقنا لتأكيد الموعد المناسب."
              center={false}
            />

          </Reveal>

          <div
            className="
              mx-auto
              max-w-4xl
              rounded-[28px]
              border
              border-[#E7E3E3]
              bg-white
              p-5
              shadow-[0_16px_40px_rgba(15,23,42,0.05)]
              md:p-8
            "
          >

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-6"
              noValidate
            >

              <div className="grid gap-5 md:grid-cols-2">

                {/* NAME */}

                <div>

                  <label
                    htmlFor="fullName"
                    className="
                      mb-2
                      block
                      text-sm
                      font-bold
                      text-slate-700
                    "
                  >
                    الاسم بالكامل
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    value={
                      form.fullName
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      submitting
                    }
                    className={`
                      w-full
                      rounded-xl
                      border
                      bg-[#FAF6F6]
                      px-4
                      py-3
                      text-slate-700
                      outline-none
                      transition
                      focus:border-primary-400
                      disabled:opacity-60

                      ${
                        errors.fullName
                          ? "border-red-300"
                          : "border-[#E7E3E3]"
                      }
                    `}
                    placeholder="أدخل الاسم بالكامل"
                  />

                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-500">
                      {
                        errors.fullName
                      }
                    </p>
                  )}

                </div>

                {/* PHONE */}

                <div>

                  <label
                    htmlFor="phone"
                    className="
                      mb-2
                      block
                      text-sm
                      font-bold
                      text-slate-700
                    "
                  >
                    رقم الهاتف
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    value={
                      form.phone
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      submitting
                    }
                    className={`
                      w-full
                      rounded-xl
                      border
                      bg-[#FAF6F6]
                      px-4
                      py-3
                      text-slate-700
                      outline-none
                      transition
                      focus:border-primary-400
                      disabled:opacity-60

                      ${
                        errors.phone
                          ? "border-red-300"
                          : "border-[#E7E3E3]"
                      }
                    `}
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                  />

                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">
                      {
                        errors.phone
                      }
                    </p>
                  )}

                </div>

                {/* ADDRESS */}

                <div className="md:col-span-2">

                  <label
                    htmlFor="address"
                    className="
                      mb-2
                      block
                      text-sm
                      font-bold
                      text-slate-700
                    "
                  >
                    العنوان
                  </label>

                  <input
                    id="address"
                    name="address"
                    value={
                      form.address
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      submitting
                    }
                    className={`
                      w-full
                      rounded-xl
                      border
                      bg-[#FAF6F6]
                      px-4
                      py-3
                      text-slate-700
                      outline-none
                      transition
                      focus:border-primary-400
                      disabled:opacity-60

                      ${
                        errors.address
                          ? "border-red-300"
                          : "border-[#E7E3E3]"
                      }
                    `}
                    placeholder="أدخل العنوان التفصيلي"
                  />

                  {errors.address && (
                    <p className="mt-1 text-sm text-red-500">
                      {
                        errors.address
                      }
                    </p>
                  )}

                </div>

                {/* SERVICE TYPE */}

                <div>

                  <label
                    htmlFor="serviceType"
                    className="
                      mb-2
                      block
                      text-sm
                      font-bold
                      text-slate-700
                    "
                  >
                    نوع الخدمة
                  </label>

                  <select
                    id="serviceType"
                    name="serviceType"
                    value={
                      form.serviceType
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      loadingServices ||
                      submitting
                    }
                    className={`
                      w-full
                      rounded-xl
                      border
                      bg-[#FAF6F6]
                      px-4
                      py-3
                      text-slate-700
                      outline-none
                      transition
                      focus:border-primary-400
                      disabled:opacity-60

                      ${
                        errors.serviceType
                          ? "border-red-300"
                          : "border-[#E7E3E3]"
                      }
                    `}
                  >

                    <option value="">
                      {loadingServices
                        ? "جاري تحميل الخدمات..."
                        : "اختر الخدمة"}
                    </option>

                    {serviceTypes.map(
                      (
                        service
                      ) => (
                        <option
                          key={
                            service.id
                          }
                          value={
                            service.id
                          }
                        >
                          {service.label ||
                            service.name}
                        </option>
                      )
                    )}

                  </select>

                  {errors.serviceType && (
                    <p className="mt-1 text-sm text-red-500">
                      {
                        errors.serviceType
                      }
                    </p>
                  )}

                  {servicesError && (
                    <p className="mt-1 text-sm text-red-500">
                      {
                        servicesError
                      }
                    </p>
                  )}

                </div>

                {/* DESCRIPTION */}

                <div className="md:col-span-2">

                  <label
                    htmlFor="caseDescription"
                    className="
                      mb-2
                      block
                      text-sm
                      font-bold
                      text-slate-700
                    "
                  >
                    وصف الحالة
                  </label>

                  <textarea
                    id="caseDescription"
                    name="caseDescription"
                    value={
                      form.caseDescription
                    }
                    onChange={
                      handleChange
                    }
                    disabled={
                      submitting
                    }
                    rows={2}
                    className={`
                      w-full
                      rounded-xl
                      border
                      bg-[#FAF6F6]
                      px-4
                      py-3
                      text-slate-700
                      outline-none
                      transition
                      focus:border-primary-400
                      disabled:opacity-60

                      ${
                        errors.caseDescription
                          ? "border-red-300"
                          : "border-[#E7E3E3]"
                      }
                    `}
                    placeholder="اكتب وصفاً مختصراً للحالة واحتياجاتك الطبية"
                  />

                  {errors.caseDescription && (
                    <p className="mt-1 text-sm text-red-500">
                      {
                        errors.caseDescription
                      }
                    </p>
                  )}

                </div>

              </div>

              {/* MESSAGE */}

              {submitState.message && (

                <div
                  className={`
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    px-4
                    py-3
                    text-sm
                    font-bold

                    ${
                      submitState.type ===
                      "success"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }
                  `}
                >

                  <CheckCircle2 className="h-4 w-4 shrink-0" />

                  {
                    submitState.message
                  }

                </div>

              )}

              {/* SUBMIT */}

              <div className="pt-2">

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    loadingServices
                  }
                  className="
                    btn
                    btn-accent
                    w-full
                    justify-center
                    shadow-[0_12px_25px_rgba(149,50,56,0.2)]
                    hover:-translate-y-0.5
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    md:w-auto
                    md:min-w-[220px]
                  "
                >

                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري إرسال الطلب...
                    </>
                  ) : (
                    "إرسال الطلب"
                  )}

                </button>

                <p className="mt-4 text-sm text-slate-500">
                  سيتم التواصل معك من فريق المستشفى لتأكيد الطلب وموعد الزيارة.
                </p>

              </div>

            </form>

          </div>

        </section>

      </div>

    </div>
  );
}