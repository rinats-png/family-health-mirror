import type { LengthUnit, MeasurementKind, TempUnit, WeightUnit } from './types';

/**
 * Einheitenumrechnung für die Anzeige.
 *
 * Gespeichert wird immer in der Basiseinheit (kg, cm, °C); die Umrechnung ist
 * reine Darstellung. Bei der Temperatur wird der vom Nutzer eingegebene Wert
 * samt der von ihm gewählten Einheit abgelegt, damit die Eingabe unverändert
 * rekonstruierbar bleibt.
 */

export const KG_PER_LB = 0.45359237;
export const CM_PER_IN = 2.54;

export function weightToDisplay(kg: number, unit: WeightUnit): number {
  return unit === 'kg' ? kg : kg / KG_PER_LB;
}

export function weightFromInput(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : value * KG_PER_LB;
}

export function lengthToDisplay(cm: number, unit: LengthUnit): number {
  return unit === 'cm' ? cm : cm / CM_PER_IN;
}

export function lengthFromInput(value: number, unit: LengthUnit): number {
  return unit === 'cm' ? value : value * CM_PER_IN;
}

export function celsiusToDisplay(c: number, unit: TempUnit): number {
  return unit === 'C' ? c : c * 1.8 + 32;
}

export function temperatureFromInput(value: number, unit: TempUnit): number {
  return unit === 'C' ? value : (value - 32) / 1.8;
}

export function unitForKind(
  kind: MeasurementKind,
  weightUnit: WeightUnit,
  lengthUnit: LengthUnit,
): string {
  return kind === 'weight' ? weightUnit : lengthUnit;
}

export function valueToDisplay(
  kind: MeasurementKind,
  value: number,
  weightUnit: WeightUnit,
  lengthUnit: LengthUnit,
): number {
  return kind === 'weight' ? weightToDisplay(value, weightUnit) : lengthToDisplay(value, lengthUnit);
}

export function valueFromInput(
  kind: MeasurementKind,
  value: number,
  weightUnit: WeightUnit,
  lengthUnit: LengthUnit,
): number {
  return kind === 'weight'
    ? weightFromInput(value, weightUnit)
    : lengthFromInput(value, lengthUnit);
}

/** Anzeige mit sinnvoller Nachkommastelle, ohne Rundungsartefakte. */
export function formatNumber(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}

export function parseDecimal(raw: string): number | undefined {
  const normalized = raw.replace(',', '.').trim();
  if (!normalized) return undefined;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}
