"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import { teethOptions } from "../BookAppointmentForm";
import { useAppSelector } from "@/app/redux/store/hooks";
import { Patient, selectPatients } from "@/app/redux/slices/patientSlice";
import { ProfileData } from "@/app/redux/slices/profileSlice";

interface AddLabWorkFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const orderTypes = [
  "Crown",
  "Bridge",
  "Denture",
  "Aligner",
  "Implant",
  "Inlay/Onlay",
  "Veneer",
  "Others",
] as const;

const materialByOrderType: Record<string, string[]> = {
  Crown: [
    "Zirconia",
    "Lithium Disilicate (e.max)",
    "PFM",
    "Full Ceramic",
    "Full Metal",
    "Composite Resin",
  ],
  Bridge: ["Zirconia", "PFM", "Full Metal", "Full Ceramic"],
  Denture: [
    "Acrylic Resin",
    "Cobalt-Chromium",
    "Flexible Nylon (Valplast)",
    "Thermoplastic Resin",
  ],
  Aligner: ["PETG", "TPU"],
  Implant: ["Titanium", "Zirconia", "Hybrid (Zirconia + Porcelain)"],
  "Inlay/Onlay": [
    "Composite Resin",
    "Zirconia",
    "Gold Alloy",
    "Lithium Disilicate (e.max)",
  ],
  Veneer: ["Lithium Disilicate (e.max)", "Porcelain", "Composite Resin"],
  Others: [
    "Zirconia",
    "Lithium Disilicate (e.max)",
    "PFM",
    "Full Ceramic",
    "Full Metal",
    "Composite Resin",
    "Acrylic Resin",
    "Cobalt-Chromium",
    "Flexible Nylon (Valplast)",
    "Thermoplastic Resin",
    "PETG",
    "TPU",
    "Titanium",
    "Hybrid (Zirconia + Porcelain)",
    "Porcelain",
    "Gold Alloy",
  ],
};

const AddLabWorkForm: React.FC<AddLabWorkFormProps> = ({
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    patientId: "",
    labName: "",
    orderType: "",
    othersText: "",
    toothNumbers: [] as string[],
    expectedDeliveryDate: "",
    status: "Pending",
    remarks: "",
    shade: "",
    material: "",
    impressionsTakenOn: new Date().toLocaleDateString("en-CA"), // ISO format
  });

  const patients = useAppSelector(selectPatients);
  const profile = useAppSelector(
    (state) => state?.profile?.profile as ProfileData
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [patientQuery, setPatientQuery] = useState("");

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.patientId.trim())
      newErrors.patientId = "Patient ID is required";
    if (!formData.labName.trim()) newErrors.labName = "Lab Name is required";
    if (!formData.orderType) newErrors.orderType = "Order Type is required";
    if (formData.orderType === "Others" && !formData.othersText.trim())
      newErrors.othersText = "Please specify the order type";
    if (formData.toothNumbers.length === 0)
      newErrors.toothNumbers = "Select at least one tooth";
    if (!formData.expectedDeliveryDate)
      newErrors.expectedDeliveryDate = "Delivery date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    // Set doctorId from profile if available
    if (profile?._id) {
      setFormData((prev) => ({
        ...prev,
        doctorId: profile._id, // Assuming doctorId is the same as profile._id
      }));
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const filteredSuggestions = useMemo(
    () =>
      patientQuery
        ? patients.filter(
            (p) =>
              p.fullName.toLowerCase().includes(patientQuery.toLowerCase()) ||
              p.PatientId.toLowerCase().includes(patientQuery.toLowerCase())
          )
        : [],
    [patientQuery, patients]
  );

  const handleSelectPatient = useCallback((patient: Patient) => {
    setPatientQuery(`${patient.fullName} (${patient.PatientId})`);
    setFormData((prev) => ({
      ...prev,
      patientId: patient._id,
    }));
  }, []);

  const handlePatientChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPatientQuery(e.target.value);
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    console.log("[LABWORK_FORM_DATA]", formData);

    try {
      const res = await fetch("/api/doctor/labWork/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Submission failed");

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("[SUBMIT_LABWORK_ERROR]", err.message);
      } else {
        console.error("[SUBMIT_LABWORK_ERROR]", err);
      }
    }
  };

  const formattedTeethOptions = teethOptions.map((tooth) => ({
    label: tooth,
    value: tooth,
  }));

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[500px] overflow-y-auto px-5"
    >
      {/* Patient ID */}
      <div className="relative">
        <Label>Patient</Label>
        <Input
          value={patientQuery}
          onChange={handlePatientChange}
          placeholder="Search by Patient ID or Name"
        />
        {filteredSuggestions.length > 0 && (
          <ul className="absolute bg-white z-10 w-full border rounded mt-2 max-h-40 overflow-y-auto">
            {filteredSuggestions.map((p) => (
              <li
                key={p._id}
                className="p-2 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSelectPatient(p)}
              >
                {p.fullName} ({p.PatientId})
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Lab Name */}
      <div>
        <Label>Lab Name</Label>
        <Input
          name="labName"
          value={formData.labName}
          onChange={handleChange}
          placeholder="Lab name"
        />
        {errors.labName && (
          <p className="text-red-500 text-sm">{errors.labName}</p>
        )}
      </div>

      {/* Order Type */}
      <div>
        <Label>Order Type</Label>
        <Select
          onValueChange={(val) =>
            setFormData((prev) => ({ ...prev, orderType: val }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select order type" />
          </SelectTrigger>
          <SelectContent>
            {orderTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.orderType && (
          <p className="text-red-500 text-sm">{errors.orderType}</p>
        )}
      </div>

      {/* Others Text */}
      {formData.orderType === "Others" && (
        <div>
          <Label>Other Type Description</Label>
          <Input
            name="othersText"
            value={formData.othersText}
            onChange={handleChange}
            placeholder="Describe the order"
          />
          {errors.othersText && (
            <p className="text-red-500 text-sm">{errors.othersText}</p>
          )}
        </div>
      )}

      {/* Tooth Numbers */}
      <div>
        <Label>Tooth Numbers</Label>
        <MultiSelect
          options={formattedTeethOptions}
          value={formData.toothNumbers}
          onValueChange={(val) =>
            setFormData((prev) => ({ ...prev, toothNumbers: val }))
          }
          placeholder="Select teeth"
          maxCount={4}
          animation={0.3}
        />
        {errors.toothNumbers && (
          <p className="text-red-500 text-sm">{errors.toothNumbers}</p>
        )}
      </div>

      {/* Shade */}
      <div>
        <Label>Shade</Label>
        <Input
          name="shade"
          value={formData.shade}
          onChange={handleChange}
          placeholder="Shade color"
        />
      </div>

      {/* Material */}
      {formData.orderType && (
        <div>
          <Label>Material</Label>
          <Select
            onValueChange={(val) =>
              setFormData((prev) => ({ ...prev, material: val }))
            }
            value={formData.material}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select material" />
            </SelectTrigger>
            <SelectContent>
              {(materialByOrderType[formData.orderType] || []).map(
                (material) => (
                  <SelectItem key={material} value={material}>
                    {material}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Impressions Taken On */}
      <div>
        <Label>Impressions Taken On</Label>
        <Input
          type="date"
          name="impressionsTakenOn"
          value={formData.impressionsTakenOn}
          onChange={handleChange}
        />
      </div>

      {/* Delivery Date */}
      <div>
        <Label>Expected Delivery Date</Label>
        <Input
          type="date"
          name="expectedDeliveryDate"
          value={formData.expectedDeliveryDate}
          onChange={handleChange}
        />
        {errors.expectedDeliveryDate && (
          <p className="text-red-500 text-sm">{errors.expectedDeliveryDate}</p>
        )}
      </div>

      {/* Remarks */}
      <div>
        <Label>Remarks</Label>
        <Textarea
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          placeholder="Any notes"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
};

export default AddLabWorkForm;
