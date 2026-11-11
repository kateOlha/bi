import {
  Alert,
  ALERT_COLOR,
  Button,
  BUTTON_COLOR,
  BUTTON_SIZE,
  BUTTON_VARIANT,
  Card,
  DeleteIcon,
  IconButton,
  PopConfirm,
  Stack,
  Typography,
  TYPOGRAPHY_COLOR,
  TYPOGRAPHY_VARIANT,
} from 'ui-kit';
import { findForm } from '../data/forms';
import { formatWhen } from '../format';
import type { SavedReport } from '../types';

export function SavedReports({ reports, onDelete }: { reports: SavedReport[]; onDelete: (id: string) => void }) {
  return (
    <div className="stack-gap">
      <div className="page-head">
        <div>
          <Typography variant={TYPOGRAPHY_VARIANT.HEADING2}>Снимки</Typography>
          <Typography variant={TYPOGRAPHY_VARIANT.BODY} color={TYPOGRAPHY_COLOR.SECONDARY}>
            Сохранённые параметры срезов. Хранятся локально в браузере.
          </Typography>
        </div>
      </div>
      {reports.length === 0 ? (
        <Alert color={ALERT_COLOR.PRIMARY} hideClose>
          Снимков пока нет. Откройте форму, постройте срез и нажмите «Снимок».
        </Alert>
      ) : (
        <div className="card-grid">
          {reports.map((report) => {
            const form = findForm(report.formId);
            return (
              <Card key={report.id} title={report.name} suffix={form?.domain ?? 'форма'}>
                <div className="stack-gap">
                  <Typography variant={TYPOGRAPHY_VARIANT.BODY} color={TYPOGRAPHY_COLOR.SECONDARY}>
                    {form?.title ?? report.formId}
                  </Typography>
                  {report.comment ? (
                    <Typography variant={TYPOGRAPHY_VARIANT.BODY}>
                      <span className="clamp">{report.comment}</span>
                    </Typography>
                  ) : null}
                  <Typography variant={TYPOGRAPHY_VARIANT.CAPTIONTEXT} color={TYPOGRAPHY_COLOR.TERTIARY}>
                    {formatWhen(report.createdAt)}
                  </Typography>
                  <Stack direction="row" gap="8px" alignItems="center">
                    <Button
                      size={BUTTON_SIZE.SMALL}
                      variant={BUTTON_VARIANT.CONTAINED}
                      onClick={() => {
                        window.location.hash = `#/form/${report.formId}?snapshot=${report.id}`;
                      }}
                    >
                      Открыть
                    </Button>
                    <PopConfirm
                      title="Удалить снимок?"
                      content="Параметры этого среза пропадут из браузера."
                      confirmLabel="Удалить"
                      rejectLabel="Оставить"
                      onConfirm={() => onDelete(report.id)}
                    >
                      <IconButton icon={DeleteIcon} title="Удалить" variant={BUTTON_VARIANT.TEXT} color={BUTTON_COLOR.ERROR} />
                    </PopConfirm>
                  </Stack>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
