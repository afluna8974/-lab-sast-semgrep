#!/usr/bin/env python3
"""Security gate: detiene el pipeline si Semgrep encontro hallazgos de severidad alta."""
import json
import sys

archivo = sys.argv[1] if len(sys.argv) > 1 else "semgrep-reporte.json"
BLOQUEA = {"ERROR", "HIGH", "CRITICAL"}
AVISA = {"WARNING", "MEDIUM"}

with open(archivo, encoding="utf-8") as f:
    datos = json.load(f)

altos, medios, bajos = [], [], []
for r in datos.get("results", []):
    sev = str(r["extra"].get("severity", "INFO")).upper()
    linea = f' - {r["path"]}:{r["start"]["line"]} -> {r["check_id"].split(".")[-1]}'
    if sev in BLOQUEA:
        altos.append(linea)
    elif sev in AVISA:
        medios.append(linea)
    else:
        bajos.append(linea)

print("=" * 60)
print(" SECURITY GATE - Resultado del analisis SAST con Semgrep")
print("=" * 60)
print(f" Severidad ALTA (bloquea el pipeline): {len(altos)}")
print(f" Severidad MEDIA (solo aviso)        : {len(medios)}")
print(f" Severidad BAJA (solo aviso)         : {len(bajos)}")
print("=" * 60)

if altos:
    print(" Hallazgos que BLOQUEAN el despliegue:")
    print("\n".join(altos))
    print("\n RESULTADO: FALLA. Corrija los hallazgos de severidad alta.")
    sys.exit(1)

print(" RESULTADO: APROBADO. No hay hallazgos de severidad alta.")
