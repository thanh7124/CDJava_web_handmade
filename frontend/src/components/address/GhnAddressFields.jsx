import { useEffect, useState } from "react";
import {
  getGhnDistricts,
  getGhnProvinces,
  getGhnWards,
} from "../../services/shipping.service";

export const emptyGhnLocation = {
  provinceId: "",
  provinceName: "",
  districtId: "",
  districtName: "",
  wardCode: "",
  wardName: "",
};

export function formatGhnAddress(detail, location) {
  return [
    detail?.trim(),
    location.wardName,
    location.districtName,
    location.provinceName,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function GhnAddressFields({
  token,
  value,
  onChange,
  fieldClassName = "",
  errors = {},
}) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  });
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    setLoading((current) => ({ ...current, provinces: true }));
    setLoadError("");

    getGhnProvinces(token)
      .then((data) => {
        if (!cancelled) setProvinces(data);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading((current) => ({ ...current, provinces: false }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token || !value.provinceId) {
      setDistricts([]);
      return;
    }

    let cancelled = false;
    setLoading((current) => ({ ...current, districts: true }));
    setLoadError("");

    getGhnDistricts(token, value.provinceId)
      .then((data) => {
        if (!cancelled) setDistricts(data);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading((current) => ({ ...current, districts: false }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, value.provinceId]);

  useEffect(() => {
    if (!token || !value.districtId) {
      setWards([]);
      return;
    }

    let cancelled = false;
    setLoading((current) => ({ ...current, wards: true }));
    setLoadError("");

    getGhnWards(token, value.districtId)
      .then((data) => {
        if (!cancelled) setWards(data);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading((current) => ({ ...current, wards: false }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, value.districtId]);

  const updateSelection = (type, id, options) => {
    const selected = options.find((item) => String(item.id) === id);

    if (type === "province") {
      onChange({
        ...emptyGhnLocation,
        provinceId: id,
        provinceName: selected?.name || "",
      });
      return;
    }

    if (type === "district") {
      onChange({
        ...value,
        districtId: id,
        districtName: selected?.name || "",
        wardCode: "",
        wardName: "",
      });
      return;
    }

    onChange({
      ...value,
      wardCode: id,
      wardName: selected?.name || "",
    });
  };

  return (
    <>
      <label className={fieldClassName}>
        <span>Tỉnh / Thành phố</span>
        <select
          value={value.provinceId}
          onChange={(event) =>
            updateSelection("province", event.target.value, provinces)
          }
          disabled={loading.provinces}
          required
        >
          <option value="">
            {loading.provinces ? "Đang tải..." : "Chọn tỉnh / thành phố"}
          </option>
          {provinces.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        {errors.province && <small>{errors.province}</small>}
      </label>

      <label className={fieldClassName}>
        <span>Quận / Huyện</span>
        <select
          value={value.districtId}
          onChange={(event) =>
            updateSelection("district", event.target.value, districts)
          }
          disabled={!value.provinceId || loading.districts}
          required
        >
          <option value="">
            {loading.districts ? "Đang tải..." : "Chọn quận / huyện"}
          </option>
          {districts.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        {errors.district && <small>{errors.district}</small>}
      </label>

      <label className={fieldClassName}>
        <span>Phường / Xã</span>
        <select
          value={value.wardCode}
          onChange={(event) =>
            updateSelection("ward", event.target.value, wards)
          }
          disabled={!value.districtId || loading.wards}
          required
        >
          <option value="">
            {loading.wards ? "Đang tải..." : "Chọn phường / xã"}
          </option>
          {wards.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        {errors.ward && <small>{errors.ward}</small>}
      </label>

      {loadError && (
        <div className="ghn-address-error">
          Không tải được địa chỉ GHN: {loadError}
        </div>
      )}
    </>
  );
}
