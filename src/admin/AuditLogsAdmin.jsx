import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAuditLogs,
} from "@/services/auditLogs";

/* =========================================================
   ACTION LABELS
========================================================= */

const ACTION_LABELS = {
  create: "إضافة",
  update: "تعديل",
  delete: "حذف",
};

/* =========================================================
   ENTITY LABELS
========================================================= */

const ENTITY_LABELS = {
  doctor: "الأطباء",
  doctors: "الأطباء",

  department: "الأقسام",
  departments: "الأقسام",

  staff: "الطاقم الإداري",

  contract: "الشركات الشريكة",
  contracts: "الشركات الشريكة",

  service: "الأجهزة الطبية",
  services: "الأجهزة الطبية",

  contact: "معلومات التواصل",
  contactinfo: "معلومات التواصل",

  statistics: "الإحصائيات",
  statistic: "الإحصائيات",
  statics: "الإحصائيات",

  applicationuser: "المستخدمين",
  identityuser: "المستخدمين",
  identityuserrole: "المستخدمين",
  "identityuserrole`1": "المستخدمين",
  user: "المستخدمين",
  users: "المستخدمين",

  appointment: "المواعيد",
  appointments: "المواعيد",

  homeappointment: "الحجز المنزلي",
  homeappointments: "الحجز المنزلي",

  patientfeedback: "الشكاوى والمقترحات",
  patientfeedbacks: "الشكاوى والمقترحات",
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeValue = (
  value
) =>
  String(
    value || ""
  )
    .trim()
    .toLowerCase();

const getActionLabel = (
  action
) => {
  const value =
    normalizeValue(
      action
    );

  return (
    ACTION_LABELS[value] ||
    action ||
    "-"
  );
};

const getEntityLabel = (
  entity
) => {
  const value =
    normalizeValue(
      entity
    );

  if (
    value.includes(
      "identityuserrole"
    ) ||
    value.includes(
      "identityuser"
    ) ||
    value.includes(
      "applicationuser"
    ) ||
    value === "user" ||
    value === "users"
  ) {
    return "المستخدمين";
  }

  return (
    ENTITY_LABELS[value] ||
    entity ||
    "-"
  );
};

/* =========================================================
   DATE
========================================================= */

const formatDate = (
  value
) => {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "ar-EG",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(date);
};

/* =========================================================
   AUDIT LOGS ADMIN
========================================================= */

export default function AuditLogsAdmin() {
  const [
    logs,
    setLogs,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;

    const loadLogs =
      async () => {
        try {
          setLoading(
            true
          );

          setError(
            ""
          );

          const data =
            await getAuditLogs();

          if (
            cancelled
          ) {
            return;
          }

          setLogs(
            Array.isArray(
              data
            )
              ? data
              : []
          );
        } catch (error) {
          console.error(
            "AUDIT LOGS ADMIN ERROR:",
            error?.response?.data ||
              error
          );

          if (
            !cancelled
          ) {
            setLogs(
              []
            );

            setError(
              "تعذر تحميل سجل النشاط"
            );
          }
        } finally {
          if (
            !cancelled
          ) {
            setLoading(
              false
            );
          }
        }
      };

    loadLogs();

    return () => {
      cancelled =
        true;
    };
  }, []);

  /* =======================================================
     SORT NEWEST FIRST
  ======================================================= */

  const sortedLogs =
    useMemo(() => {
      return [
        ...logs,
      ].sort(
        (
          a,
          b
        ) => {
          const aDate =
            new Date(
              a?.createdAt ||
                0
            ).getTime();

          const bDate =
            new Date(
              b?.createdAt ||
                0
            ).getTime();

          return (
            bDate -
            aDate
          );
        }
      );
    }, [
      logs,
    ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({
          length: 6,
        }).map(
          (
            _,
            index
          ) => (
            <div
              key={
                index
              }
              className="
                h-16
                rounded-xl
                shimmer-bg
              "
            />
          )
        )}
      </div>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className="
        space-y-6
        p-4
        md:p-6
      "
      dir="rtl"
    >
      {/* ERROR */}

      {error && (
        <div
          className="
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            font-bold
            text-red-700
          "
        >
          {error}
        </div>
      )}

      {/* TABLE */}

      <div
        className="
          card
          overflow-hidden
        "
      >
        <div
          className="
            overflow-x-auto
          "
        >
          <table
            className="
              w-full
              min-w-[900px]
              text-right
            "
          >
            {/* HEADER */}

            <thead
              className="
                bg-slate-50
              "
            >
              <tr
                className="
                  border-b
                  border-slate-200
                  text-sm
                  text-slate-700
                "
              >
                <th
                  className="
                    px-5
                    py-4
                    font-extrabold
                  "
                >
                  الشخص
                </th>

                <th
                  className="
                    px-5
                    py-4
                    text-center
                    font-extrabold
                  "
                >
                   ماذا فعل
                </th>

                <th
                  className="
                    px-5
                    py-4
                    text-center
                    font-extrabold
                  "
                >
                  فين
                </th>

                <th
                  className="
                    px-5
                    py-4
                    text-center
                    font-extrabold
                  "
                >
                  العنصر
                </th>

                <th
                  className="
                    px-5
                    py-4
                    text-center
                    font-extrabold
                  "
                >
                  التاريخ
                </th>
              </tr>
            </thead>

            {/* BODY */}

            <tbody>
              {sortedLogs.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="
                      px-5
                      py-12
                      text-center
                      text-slate-500
                    "
                  >
                    لا يوجد سجل نشاط
                  </td>
                </tr>
              ) : (
                sortedLogs.map(
                  (
                    log,
                    index
                  ) => {
                    const action =
                      getActionLabel(
                        log.action
                      );

                    const entity =
                      getEntityLabel(
                        log.entityName
                      );

                    return (
                      <tr
                        key={
                          log.id ??
                          index
                        }
                        className="
                          border-b
                          border-slate-100
                          transition-colors
                          hover:bg-slate-50
                        "
                      >
                        {/* WHO */}

                        <td
                          className="
                            px-5
                            py-4
                          "
                        >
                          <div>
                            <p
                              className="
                                text-sm
                                font-extrabold
                                text-slate-800
                              "
                            >
                              {log.userName ||
                                "غير معروف"}
                            </p>

                            {log.userEmail && (
                              <p
                                className="
                                  mt-1
                                  text-xs
                                  font-medium
                                  text-slate-400
                                "
                                dir="ltr"
                              >
                                {
                                  log.userEmail
                                }
                              </p>
                            )}
                          </div>
                        </td>

                        {/* ACTION */}

                        <td
                          className="
                            px-5
                            py-4
                            text-center
                          "
                        >
                          <span
                            className={`
                              inline-flex
                              items-center
                              justify-center
                              min-w-[70px]
                              rounded-full
                              px-3
                              py-1.5
                              text-xs
                              font-extrabold

                              ${
                                normalizeValue(
                                  log.action
                                ) ===
                                "create"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : normalizeValue(
                                      log.action
                                    ) ===
                                    "delete"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-blue-50 text-blue-700"
                              }
                            `}
                          >
                            {action}
                          </span>
                        </td>

                        {/* WHERE */}

                        <td
                          className="
                            px-5
                            py-4
                            text-center
                          "
                        >
                          <span
                            className="
                              inline-flex
                              items-center
                              justify-center
                              rounded-lg
                              bg-slate-100
                              px-3
                              py-1.5
                              text-sm
                              font-bold
                              text-slate-700
                            "
                          >
                            {entity}
                          </span>
                        </td>

                        {/* ENTITY DISPLAY NAME */}

                        <td
                          className="
                            px-5
                            py-4
                            text-center
                          "
                        >
                          {log.entityDisplayName ? (
                            <span
                              className="
                                text-sm
                                font-extrabold
                                text-slate-800
                              "
                            >
                              {
                                log.entityDisplayName
                              }
                            </span>
                          ) : (
                            <span
                              className="
                                text-sm
                                text-slate-400
                              "
                            >
                              -
                            </span>
                          )}
                        </td>

                        {/* DATE */}

                        <td
                          className="
                            px-5
                            py-4
                            text-center
                          "
                        >
                          <span
                            className="
                              text-xs
                              font-medium
                              text-slate-500
                            "
                          >
                            {formatDate(
                              log.createdAt
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}