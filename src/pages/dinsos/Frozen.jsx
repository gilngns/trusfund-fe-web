import { useEffect, useState, useCallback } from "react";
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
      alert(e.message);
      setList([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resolve = async (c, approve) => {
    setBusyId(c.id);
    try {
      await campaignApi.resolveFrozen(c.id, approve);
      alert(approve ? "Kampanye dilanjutkan." : "Refund diaktifkan untuk donatur.");
      load();
    } catch (e) {
      alert(e.message);
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
                        onClick={() => resolve(c, true)}
                      >
                        Lanjutkan
                      </Button>
                      <Button
                        variant="reject"
                        disabled={busyId === c.id}
                        onClick={() => resolve(c, false)}
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
