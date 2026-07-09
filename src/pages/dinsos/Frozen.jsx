import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { campaignApi } from "../../api/client";
import { rp } from "../../api/format";
import { Button, Empty, Loading, Card } from "../../components/ui";

export default function Frozen() {
  const [list, setList] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const d = await campaignApi.list("FROZEN");
      setList(d.campaigns || []);
    } catch (e) {
      Swal.fire("Error", e.message, "error");
      setList([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleResolve = async (c, approve) => {
    setBusyId(c.id);
    try {
      const result = await Swal.fire({
        title: "Tentukan Tindakan",
        text: "Pilih tindakan untuk kampanye bermasalah ini.",
        icon: "warning",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Lanjutkan Kampanye",
        denyButtonText: "Refund Donatur",
        cancelButtonText: "Batal",
        confirmButtonColor: "#0d9488",
        denyButtonColor: "#f43f5e",
      });

      if (result.isDismissed) {
        setBusyId(null);
        return;
      }
      
      const isApprove = result.isConfirmed;
      await campaignApi.resolveFrozen(c.id, isApprove);
      Swal.fire("Berhasil", isApprove ? "Kampanye dilanjutkan." : "Refund diaktifkan untuk donatur.", "success");
      load();
    } catch (e) {
      Swal.fire("Gagal", e.message, "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <h1 className="page-title">Kampanye Beku</h1>
      <p className="page-sub">
        Putuskan kampanye yang dibekukan: lanjutkan program atau kembalikan dana
        ke donatur.
      </p>

      <Card>
        {list === null ? (
          <Loading />
        ) : list.length === 0 ? (
          <Empty>Tidak ada kampanye beku. Semua berjalan normal.</Empty>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Kampanye</th>
                <th>Yayasan</th>
                <th>Target</th>
                <th>Keputusan</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td>
                    <b>{c.title}</b>
                  </td>
                  <td>{c.foundation?.name || "—"}</td>
                  <td className="mono">{rp(c.targetAmount)}</td>
                  <td>
                    <div className="act">
                      <Button
                        variant="approve"
                        disabled={busyId === c.id}
                        onClick={() => handleResolve(c, true)}
                      >
                        Lanjutkan
                      </Button>
                      <Button
                        variant="reject"
                        disabled={busyId === c.id}
                        onClick={() => handleResolve(c, false)}
                      >
                        Refund
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
