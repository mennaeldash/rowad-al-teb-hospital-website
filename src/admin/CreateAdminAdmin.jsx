import {
  useEffect,
  useState,
} from "react";

import {
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  ShieldCheck,
  Trash2,
  Users,
  RefreshCw,
} from "lucide-react";

import {
  createAdmin,
  getUsers,
  deleteUser,
} from "@/services/login";

/* =========================================================
   CREATE ADMIN PAGE
========================================================= */

export default function CreateAdminAdmin() {
  const [
    form,
    setForm,
  ] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Manager",
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    users,
    setUsers,
  ] = useState([]);

  const [
    usersLoading,
    setUsersLoading,
  ] = useState(true);

  const [
    usersError,
    setUsersError,
  ] = useState("");

  const [
    deletingUserId,
    setDeletingUserId,
  ] = useState("");

  /* =======================================================
     USERS
  ======================================================= */

  const loadUsers =
    async () => {
      setUsersLoading(true);
      setUsersError("");

      try {
        const data =
          await getUsers();

        setUsers(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        console.error(
          "GET USERS ERROR:",
          err
        );

        if (
          err?.response?.status ===
          401
        ) {
          setUsersError(
            "غير مصرح لك بعرض الحسابات"
          );
        } else if (
          err?.response?.status ===
          403
        ) {
          setUsersError(
            "ليس لديك الصلاحية لعرض الحسابات"
          );
        } else {
          setUsersError(
            "تعذر تحميل حسابات الأدمن والمانجر"
          );
        }
      } finally {
        setUsersLoading(false);
      }
    };

  useEffect(() => {
    loadUsers();
  }, []);

  /* =======================================================
     INPUT
  ======================================================= */

  const handleChange = (
    field,
    value
  ) => {
    setForm(
      (
        previous
      ) => ({
        ...previous,

        [field]:
          value,
      })
    );

    setError("");
    setSuccess("");
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      const fullName =
        form.fullName.trim();

      const email =
        form.email.trim();

      const password =
        form.password;

      const confirmPassword =
        form.confirmPassword;

      const role =
        form.role;

      /* =====================================================
         FULL NAME
      ===================================================== */

      if (!fullName) {
        setError(
          "من فضلك أدخل اسم الأدمن"
        );

        return;
      }

      /* =====================================================
         EMAIL
      ===================================================== */

      if (!email) {
        setError(
          "من فضلك أدخل البريد الإلكتروني"
        );

        return;
      }

      /* =====================================================
         PASSWORD
      ===================================================== */

      if (!password) {
        setError(
          "من فضلك أدخل كلمة المرور"
        );

        return;
      }

      /* =====================================================
         CONFIRM PASSWORD
      ===================================================== */

      if (
        !confirmPassword
      ) {
        setError(
          "من فضلك أكد كلمة المرور"
        );

        return;
      }

      /* =====================================================
         PASSWORD MATCH
      ===================================================== */

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "كلمة المرور وتأكيد كلمة المرور غير متطابقين"
        );

        return;
      }

      /* =====================================================
         ROLE
      ===================================================== */

      if (!role) {
        setError(
          "من فضلك اختر صلاحية الأدمن"
        );

        return;
      }

      /* =====================================================
         REQUEST
      ===================================================== */

      setLoading(
        true
      );

      try {
        await createAdmin({
          fullName,
          email,
          password,
          confirmPassword,
          role,
        });

        setSuccess(
          "تم إضافة الأدمن بنجاح"
        );

        /* ===================================================
           RESET FORM
        =================================================== */

        setForm({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "Manager",
        });

        setShowPassword(
          false
        );

        setShowConfirmPassword(
          false
        );

        await loadUsers();
      } catch (err) {
        console.error(
          "CREATE ADMIN ERROR:",
          err
        );

        const backendMessage =
          err?.response?.data?.message ??
          err?.response?.data?.title ??
          err?.response?.data ??
          err?.message ??
          null;

        /* ===================================================
           401
        =================================================== */

        if (
          err?.response?.status ===
          401
        ) {
          setError(
            "غير مصرح لك بإضافة أدمن جديد"
          );

          return;
        }

        /* ===================================================
           403
        =================================================== */

        if (
          err?.response?.status ===
          403
        ) {
          setError(
            "ليس لديك الصلاحية لإضافة أدمن جديد"
          );

          return;
        }

        /* ===================================================
           BACKEND MESSAGE
        =================================================== */

        if (
          typeof backendMessage ===
          "string"
        ) {
          setError(
            backendMessage
          );
        } else {
          setError(
            "حدث خطأ أثناء إضافة الأدمن"
          );
        }
      } finally {
        setLoading(
          false
        );
      }
    };

  /* =======================================================
     DELETE USER
  ======================================================= */

  const handleDeleteUser =
    async (
      user
    ) => {
      const userId =
        String(
          user?.id ?? ""
        ).trim();

      if (!userId) {
        setUsersError(
          "تعذر تحديد الحساب المراد حذفه"
        );

        return;
      }

      const userName =
        String(
          user?.fullName ||
          user?.email ||
          "هذا الحساب"
        ).trim();

      const confirmed =
        window.confirm(
          `هل أنت متأكد من حذف ${userName}؟\nلا يمكن التراجع عن الحذف.`
        );

      if (!confirmed) {
        return;
      }

      setDeletingUserId(
        userId
      );

      setUsersError("");
      setSuccess("");

      try {
        await deleteUser(
          userId
        );

        setUsers(
          (
            previousUsers
          ) =>
            previousUsers.filter(
              (
                item
              ) =>
                String(
                  item?.id
                ) !==
                userId
            )
        );

        setSuccess(
          "تم حذف الحساب بنجاح"
        );
      } catch (err) {
        console.error(
          "DELETE USER ERROR:",
          err
        );

        const backendMessage =
          err?.response?.data?.message ??
          err?.response?.data?.title ??
          err?.response?.data ??
          "";

        if (
          err?.response?.status ===
          401
        ) {
          setUsersError(
            "غير مصرح لك بحذف هذا الحساب"
          );
        } else if (
          err?.response?.status ===
          403
        ) {
          setUsersError(
            "ليس لديك الصلاحية لحذف هذا الحساب"
          );
        } else if (
          typeof backendMessage ===
            "string" &&
          backendMessage.trim()
        ) {
          setUsersError(
            backendMessage
          );
        } else {
          setUsersError(
            "حدث خطأ أثناء حذف الحساب"
          );
        }
      } finally {
        setDeletingUserId(
          ""
        );
      }
    };

  /* =======================================================
     STYLES
  ======================================================= */

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-200 " +
    "focus:border-primary-500 focus:ring-2 focus:ring-primary-200 " +
    "outline-none transition-all bg-white text-slate-800";

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="
        max-w-4xl
        mx-auto
        space-y-6
      "
    >
      <div
        className="
          bg-white
          rounded-3xl
          border
          border-slate-200
          shadow-sm
          overflow-hidden
          max-w-2xl
          mx-auto
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            p-6
            border-b
            border-slate-100
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            <div
              className="
                w-12
                h-12
                rounded-2xl
                bg-primary-50
                text-primary-600
                flex
                items-center
                justify-center
              "
            >
              <UserPlus
                className="
                  w-6
                  h-6
                "
              />
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-extrabold
                  text-slate-800
                "
              >
                إضافة أدمن جديد
              </h2>

              <p
                className="
                  text-sm
                  text-slate-500
                  mt-1
                "
              >
                إنشاء حساب جديد وتحديد صلاحية الدخول إلى لوحة التحكم
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={
            handleSubmit
          }
          className="
            p-6
            space-y-5
          "
        >

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              className="
                p-4
                rounded-xl
                bg-red-50
                text-red-700
                text-sm
                font-bold
              "
            >
              {error}
            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (
            <div
              className="
                p-4
                rounded-xl
                bg-emerald-50
                text-emerald-700
                text-sm
                font-bold
                flex
                items-center
                gap-2
              "
            >
              <CheckCircle
                className="
                  w-5
                  h-5
                "
              />

              {success}
            </div>
          )}

          {/* =================================================
              FULL NAME
          ================================================= */}

          <div>
            <label
              className="
                block
                text-sm
                font-bold
                text-slate-700
                mb-2
              "
            >
              اسم الأدمن *
            </label>

            <div className="relative">
              <User
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  w-5
                  h-5
                  text-slate-400
                "
              />

              <input
                type="text"
                value={
                  form.fullName
                }
                onChange={(
                  event
                ) =>
                  handleChange(
                    "fullName",
                    event.target.value
                  )
                }
                className={`${inputClass} pr-12`}
                placeholder="اسم الأدمن بالكامل"
                required
                disabled={
                  loading
                }
              />
            </div>
          </div>

          {/* =================================================
              EMAIL
          ================================================= */}

          <div>
            <label
              className="
                block
                text-sm
                font-bold
                text-slate-700
                mb-2
              "
            >
              البريد الإلكتروني *
            </label>

            <div className="relative">
              <Mail
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  w-5
                  h-5
                  text-slate-400
                "
              />

              <input
                type="email"
                value={
                  form.email
                }
                onChange={(
                  event
                ) =>
                  handleChange(
                    "email",
                    event.target.value
                  )
                }
                className={`${inputClass} pr-12`}
                placeholder="admin@example.com"
                dir="ltr"
                required
                disabled={
                  loading
                }
              />
            </div>
          </div>

          {/* =================================================
              PASSWORD
          ================================================= */}

          <div>
            <label
              className="
                block
                text-sm
                font-bold
                text-slate-700
                mb-2
              "
            >
              كلمة المرور *
            </label>

            <div className="relative">
              <Lock
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  w-5
                  h-5
                  text-slate-400
                "
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={
                  form.password
                }
                onChange={(
                  event
                ) =>
                  handleChange(
                    "password",
                    event.target.value
                  )
                }
                className={`${inputClass} pr-12 pl-12`}
                placeholder="كلمة المرور"
                required
                disabled={
                  loading
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (
                      value
                    ) =>
                      !value
                  )
                }
                disabled={
                  loading
                }
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  hover:text-slate-700
                  disabled:opacity-50
                "
              >
                {showPassword ? (
                  <EyeOff
                    className="
                      w-5
                      h-5
                    "
                  />
                ) : (
                  <Eye
                    className="
                      w-5
                      h-5
                    "
                  />
                )}
              </button>
            </div>
          </div>

          {/* =================================================
              CONFIRM PASSWORD
          ================================================= */}

          <div>
            <label
              className="
                block
                text-sm
                font-bold
                text-slate-700
                mb-2
              "
            >
              تأكيد كلمة المرور *
            </label>

            <div className="relative">
              <Lock
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  w-5
                  h-5
                  text-slate-400
                "
              />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={
                  form.confirmPassword
                }
                onChange={(
                  event
                ) =>
                  handleChange(
                    "confirmPassword",
                    event.target.value
                  )
                }
                className={`${inputClass} pr-12 pl-12`}
                placeholder="أعد كتابة كلمة المرور"
                required
                disabled={
                  loading
                }
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (
                      value
                    ) =>
                      !value
                  )
                }
                disabled={
                  loading
                }
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                  hover:text-slate-700
                  disabled:opacity-50
                "
              >
                {showConfirmPassword ? (
                  <EyeOff
                    className="
                      w-5
                      h-5
                    "
                  />
                ) : (
                  <Eye
                    className="
                      w-5
                      h-5
                    "
                  />
                )}
              </button>
            </div>
          </div>

          {/* =================================================
              ROLE
          ================================================= */}

          <div>
            <label
              className="
                block
                text-sm
                font-bold
                text-slate-700
                mb-2
              "
            >
              صلاحية الأدمن *
            </label>

            <div className="relative">
              <ShieldCheck
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  w-5
                  h-5
                  text-slate-400
                  pointer-events-none
                "
              />

              <select
                value={
                  form.role
                }
                onChange={(
                  event
                ) =>
                  handleChange(
                    "role",
                    event.target.value
                  )
                }
                className={`${inputClass} pr-12`}
                required
                disabled={
                  loading
                }
              >
                <option value="Manager">
                  Manager
                </option>

                <option value="Admin">
                  Admin
                </option>
              </select>
            </div>

            <p
              className="
                text-xs
                text-slate-500
                mt-2
              "
            >
              اختر مستوى الصلاحية للحساب الجديد
            </p>
          </div>

          {/* =================================================
              SUBMIT
          ================================================= */}

          <div
            className="
              pt-3
            "
          >
            <button
              type="submit"
              disabled={
                loading
              }
              className="
                btn
                btn-primary
                w-full
                py-3
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {loading ? (
                <>
                  <Loader2
                    className="
                      w-5
                      h-5
                      animate-spin
                    "
                  />

                  جاري إضافة الأدمن...
                </>
              ) : (
                <>
                  <UserPlus
                    className="
                      w-5
                      h-5
                    "
                  />

                  إضافة الأدمن
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* =====================================================
          USERS MANAGEMENT
      ===================================================== */}

      <div
        className="
          bg-white
          rounded-3xl
          border
          border-slate-200
          shadow-sm
          overflow-hidden
        "
      >
        <div
          className="
            p-6
            border-b
            border-slate-100
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
            "
          >
            <div
              className="
                w-12
                h-12
                rounded-2xl
                bg-primary-50
                text-primary-600
                flex
                items-center
                justify-center
              "
            >
              <Users
                className="
                  w-6
                  h-6
                "
              />
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-extrabold
                  text-slate-800
                "
              >
                إدارة الحسابات
              </h2>

              <p
                className="
                  text-sm
                  text-slate-500
                  mt-1
                "
              >
                عرض وحذف حسابات الـ Admin والـ Manager
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              loadUsers
            }
            disabled={
              usersLoading
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              px-4
              py-2.5
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-700
              text-sm
              font-bold
              hover:bg-slate-50
              transition-all
              disabled:opacity-50
            "
          >
            <RefreshCw
              className={`w-4 h-4 ${
                usersLoading
                  ? "animate-spin"
                  : ""
              }`}
            />

            تحديث
          </button>
        </div>

        <div className="p-6">
          {usersError && (
            <div
              className="
                p-4
                rounded-xl
                bg-red-50
                text-red-700
                text-sm
                font-bold
                mb-5
              "
            >
              {usersError}
            </div>
          )}

          {usersLoading ? (
            <div
              className="
                py-12
                flex
                flex-col
                items-center
                justify-center
                gap-3
                text-slate-500
              "
            >
              <Loader2
                className="
                  w-7
                  h-7
                  animate-spin
                  text-primary-600
                "
              />

              <span className="text-sm font-bold">
                جاري تحميل الحسابات...
              </span>
            </div>
          ) : users.length === 0 ? (
            <div
              className="
                py-12
                text-center
                text-slate-500
                text-sm
                font-bold
              "
            >
              لا توجد حسابات حالياً
            </div>
          ) : (
            <div className="space-y-3">
              {users.map(
                (
                  user
                ) => {
                  const userId =
                    String(
                      user?.id ??
                      ""
                    );

                  const isDeleting =
                    deletingUserId ===
                    userId;

                  const role =
                    String(
                      user?.role ??
                      ""
                    );

                  return (
                    <div
                      key={
                        userId
                      }
                      className="
                        rounded-2xl
                        border
                        border-slate-200
                        bg-slate-50/60
                        p-4
                        flex
                        flex-col
                        md:flex-row
                        md:items-center
                        md:justify-between
                        gap-4
                      "
                    >
                      <div
                        className="
                          min-w-0
                          flex
                          items-start
                          gap-3
                        "
                      >
                        <div
                          className="
                            w-10
                            h-10
                            shrink-0
                            rounded-xl
                            bg-white
                            border
                            border-slate-200
                            text-primary-600
                            flex
                            items-center
                            justify-center
                          "
                        >
                          <User
                            className="
                              w-5
                              h-5
                            "
                          />
                        </div>

                        <div className="min-w-0">
                          <div
                            className="
                              flex
                              flex-wrap
                              items-center
                              gap-2
                            "
                          >
                            <p
                              className="
                                font-extrabold
                                text-slate-800
                                break-words
                              "
                            >
                              {user?.fullName?.trim()
                                ? user.fullName
                                : "بدون اسم"}
                            </p>

                            <span
                              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                                role === "Admin"
                                  ? "bg-primary-100 text-primary-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {role ||
                                "غير محدد"}
                            </span>
                          </div>

                          <p
                            className="
                              mt-1
                              text-sm
                              text-slate-500
                              break-all
                            "
                            dir="ltr"
                          >
                            {user?.email ||
                              "لا يوجد بريد إلكتروني"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteUser(
                            user
                          )
                        }
                        disabled={
                          isDeleting ||
                          !userId
                        }
                        className="
                          inline-flex
                          items-center
                          justify-center
                          gap-2
                          px-4
                          py-2.5
                          rounded-xl
                          bg-red-50
                          text-red-600
                          text-sm
                          font-extrabold
                          hover:bg-red-600
                          hover:text-white
                          transition-all
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                          md:shrink-0
                        "
                      >
                        {isDeleting ? (
                          <Loader2
                            className="
                              w-4
                              h-4
                              animate-spin
                            "
                          />
                        ) : (
                          <Trash2
                            className="
                              w-4
                              h-4
                            "
                          />
                        )}

                        {isDeleting
                          ? "جاري الحذف..."
                          : "حذف الحساب"}
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}