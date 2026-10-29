import {
  IonButton,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  useIonRouter,
  useIonToast,
} from '@ionic/react';
import { type FormEvent, useState } from 'react';
import { TIME_OFF_TYPES, TYPE_LABELS, type TimeOffType } from '../../../shared/types/request';
import { countWorkingDays, formatDateRange, todayString } from '../../../shared/utils/dates';

import styles from './NewRequestForm.module.css';
import { newRequestSchema, NOTE_MAX_LENGTH } from '../../../shared/schema/newRequestSchema';
import { useCreateRequest } from '../hooks/queries';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { ApiError } from '../../../shared/api/ApiError';
import z from 'zod';

type FormValues = {
  type: TimeOffType | '';
  startDate: string;
  endDate: string;
  note?: string;
};

const EMPTY_FORM: FormValues = { type: '', startDate: '', endDate: '', note: '' };

type FieldErrors = Partial<Record<keyof FormValues, string[]>>;

const fieldErrorsOf = (values: FormValues): FieldErrors => {
  const result = newRequestSchema.safeParse(values);
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
};

export const NewRequestForm = () => {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const create = useCreateRequest();
  const router = useIonRouter();
  const [presentToast] = useIonToast();

  const errors: FieldErrors = submitted ? fieldErrorsOf(values) : {};

  const set = (field: keyof FormValues) => (value: string | null | undefined) => {
    setValues((current) => ({ ...current, [field]: value ?? '' }));
    setFormError(null);
  };

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    setSubmitted(true);

    const result = newRequestSchema.safeParse(values);
    if (!result.success) return;

    create.mutate(result.data, {
      onSuccess: () => {
        void presentToast({
          message: 'Request sent',
          icon: checkmarkCircleOutline,
          cssClass: 'toast-success',
          duration: 3000,
          position: 'bottom',
        });
        // Usually opened from the list: go back. Opened directly: go to the list.
        if (router.canGoBack()) router.goBack();
        else router.push('/requests', 'back', 'replace');
      },
      onError: (error) => {
        // The form stays filled in, so nothing is lost
        setFormError(
          error instanceof ApiError && (error.code === 'CONFLICT' || error.code === 'VALIDATION')
            ? error.message
            : "We couldn't send your request. Please try again.",
        );
      },
    });
  };

  const workingDays =
    values.startDate && values.endDate && values.endDate >= values.startDate
      ? countWorkingDays(values.startDate, values.endDate)
      : null;

  const minStart = values.type === 'sick' ? undefined : todayString();

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      {formError && (
        <p role="alert" className={styles.formError}>
          {formError}
        </p>
      )}

      <IonSelect
        label="Type"
        labelPlacement="stacked"
        fill="outline"
        interface="action-sheet"
        placeholder="Choose a type"
        value={values.type}
        onIonChange={(event) => set('type')(event.detail.value)}
        errorText={errors.type?.[0]}
        className={errors.type ? 'ion-invalid ion-touched' : undefined}
        disabled={create.isPending}
      >
        {TIME_OFF_TYPES.map((type) => (
          <IonSelectOption key={type} value={type}>
            {TYPE_LABELS[type]}
          </IonSelectOption>
        ))}
      </IonSelect>

      <div className={styles.dates}>
        <IonInput
          type="date"
          label="From"
          labelPlacement="stacked"
          fill="outline"
          min={minStart}
          value={values.startDate}
          onIonInput={(event) => set('startDate')(event.detail.value)}
          errorText={errors.startDate?.[0]}
          className={errors.startDate ? 'ion-invalid ion-touched' : undefined}
          disabled={create.isPending}
        />

        <IonInput
          type="date"
          label="To"
          labelPlacement="stacked"
          fill="outline"
          min={values.startDate || minStart}
          value={values.endDate}
          onIonInput={(event) => set('endDate')(event.detail.value)}
          errorText={errors.endDate?.[0]}
          className={errors.endDate ? 'ion-invalid ion-touched' : undefined}
          disabled={create.isPending}
        />
      </div>

      {workingDays !== null && (
        <p className={styles.workingDays} aria-live="polite">
          <strong>
            {workingDays} {workingDays === 1 ? 'working day' : 'working days'}
          </strong>{' '}
          · {formatDateRange(values.startDate, values.endDate)}
        </p>
      )}

      <IonTextarea
        label="Note (optional)"
        labelPlacement="stacked"
        fill="outline"
        placeholder="Anything your supervisor should know"
        autoGrow
        rows={3}
        maxlength={NOTE_MAX_LENGTH}
        counter
        value={values.note}
        onIonInput={(event) => set('note')(event.detail.value)}
        errorText={errors.note?.[0]}
        className={errors.note ? 'ion-invalid ion-touched' : undefined}
        disabled={create.isPending}
      />

      <IonButton
        expand="block"
        className={styles.submit}
        onClick={() => submit()}
        disabled={create.isPending}
      >
        {create.isPending ? 'Sending…' : 'Send request'}
      </IonButton>
    </form>
  );
};
