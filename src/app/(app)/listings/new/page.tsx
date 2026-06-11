"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle, Circle, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useFlash } from "@/components/FlashProvider";
import { PageHeader } from "@/components/PageHeader";
import {
  SearchablePicker,
  pickerGroupsFromRegions,
} from "@/components/SearchablePicker";
import { SelectablePill } from "@/components/SelectablePill";
import { stockTypes, type PaddockListing } from "@/lib/dummyData";
import { createPaddockListingRecord } from "@/lib/data/repositories";
import {
  geocodeLocation,
  type GeocodedLocation,
} from "@/lib/locationGeocode";
import { findRegion, regionsGroupedByState } from "@/lib/regions";

const regionPickerGroups = pickerGroupsFromRegions(regionsGroupedByState());
const feedOptions: PaddockListing["feedStatus"][] = ["Excellent", "Good", "Tight"];
const waterOptions: PaddockListing["waterStatus"][] = ["Permanent", "Seasonal", "Tank"];
const fencingOptions: PaddockListing["fencingStatus"][] = [
  "Secure",
  "Good",
  "Needs inspection",
];

export default function NewListingPage() {
  const router = useRouter();
  const flash = useFlash();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  // Region stored as canonical id; resolved to its human label when we
  // persist the listing so seed-shaped filters keep working.
  const [regionId, setRegionId] = useState<string | undefined>("southern-nsw");
  const region = findRegion(regionId)?.label ?? "";
  const [acres, setAcres] = useState(200);
  const [suitableLivestock, setSuitableLivestock] = useState<string[]>(["Cattle"]);
  const [feedStatus, setFeedStatus] = useState<PaddockListing["feedStatus"]>("Excellent");
  const [waterStatus, setWaterStatus] = useState<PaddockListing["waterStatus"]>("Permanent");
  const [fencingStatus, setFencingStatus] =
    useState<PaddockListing["fencingStatus"]>("Secure");
  const [feedNote, setFeedNote] = useState("");
  const [waterNote, setWaterNote] = useState("");
  const [fencingNote, setFencingNote] = useState("");
  const [availabilityWindow, setAvailabilityWindow] = useState("");
  const [summary, setSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [confirmedLocation, setConfirmedLocation] =
    useState<GeocodedLocation | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_PHOTOS = 6;
  const MAX_BYTES_PER_PHOTO = 6 * 1024 * 1024;

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      flash(`You can attach up to ${MAX_PHOTOS} photos.`, "warning");
      return;
    }
    const accepted: File[] = [];
    let oversize = 0;
    for (const file of files.slice(0, room)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_BYTES_PER_PHOTO) {
        oversize += 1;
        continue;
      }
      accepted.push(file);
    }
    if (oversize > 0) {
      flash(
        `${oversize} photo${oversize === 1 ? "" : "s"} skipped - keep each under 6 MB.`,
        "warning"
      );
    }
    const dataUrls = await Promise.all(accepted.map(readCompressedDataUrl));
    setPhotos((current) => [...current, ...dataUrls]);
  }

  function removePhoto(index: number) {
    setPhotos((current) => current.filter((_, i) => i !== index));
  }

  function toggleLivestock(value: string) {
    setSuitableLivestock((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  async function publishListing() {
    if (submitting) return;
    if (!title.trim()) {
      flash("Add a name for your listing.", "warning");
      return;
    }
    if (!location.trim()) {
      flash("Add the property location.", "warning");
      return;
    }
    if (!confirmedLocation) {
      flash("Confirm the property location before publishing.", "warning");
      return;
    }
    if (!region) {
      flash("Pick the region closest to your paddock.", "warning");
      return;
    }
    if (acres <= 0) {
      flash("Set the available acres.", "warning");
      return;
    }
    if (suitableLivestock.length === 0) {
      flash("Pick at least one suitable livestock type.", "warning");
      return;
    }
    if (!summary.trim()) {
      flash("Add a short summary so farmers know what they're enquiring about.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createPaddockListingRecord({
        title: title.trim(),
        location: location.trim(),
        region,
        acres,
        suitableLivestock,
        feedStatus,
        waterStatus,
        fencingStatus,
        feedNote: feedNote.trim(),
        waterNote: waterNote.trim(),
        fencingNote: fencingNote.trim(),
        availabilityWindow: availabilityWindow.trim() || "Discuss availability",
        guideTerms: "Discuss terms",
        summary: summary.trim(),
        photos,
        latitude: confirmedLocation.latitude,
        longitude: confirmedLocation.longitude,
        placeId: confirmedLocation.placeId,
      });
      if (!created) {
        flash("Could not publish the listing. Please try again.", "warning");
        setSubmitting(false);
        return;
      }
      flash("Listing published.", "success");
      router.push(`/listings/${created.listing.id}?published=1`);
    } catch {
      flash("Could not publish the listing. Please try again.", "warning");
      setSubmitting(false);
    }
  }

  async function confirmListingLocation() {
    if (!location.trim()) {
      flash("Add the property location first.", "warning");
      return;
    }
    setGeocoding(true);
    const result = await geocodeLocation({
      query: location.trim(),
      region,
    });
    setGeocoding(false);
    if (!result) {
      flash("Could not confirm that location. Try a fuller address or nearby town.", "warning");
      return;
    }
    setLocation(result.formattedAddress);
    setConfirmedLocation(result);
    flash("Property location confirmed.", "success");
  }

  return (
    <>
      <PageHeader
        eyebrow="Offer agistment"
        title="List spare paddock capacity."
        description="Add the location, acres, livestock fit, feed, water, fencing and access notes farmers need before they enquire."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.55fr]">
        <div className="space-y-5">
          <Card>
            <SectionTitle eyebrow="Step 1" title="Property basics" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField
                  label="Listing name"
                  value={title}
                  onChange={setTitle}
                  placeholder="e.g. Glenbarra River Paddocks"
                />
              </div>
              <TextField
                label="Location"
                value={location}
                onChange={(value) => {
                  setLocation(value);
                  setConfirmedLocation(null);
                }}
                placeholder="e.g. 42 River Road, Gundagai NSW"
              />
              <NumberField label="Available acres" value={acres} onChange={setAcres} />
              <div className="sm:col-span-2">
                <TextField
                  label="Availability window"
                  value={availabilityWindow}
                  onChange={setAvailabilityWindow}
                  placeholder="e.g. 18 May to 30 September"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="secondary"
                onClick={confirmListingLocation}
                disabled={geocoding}
              >
                {geocoding ? "Checking location" : "Confirm location"}
              </Button>
              <p className="text-sm font-bold text-bark/70">
                {confirmedLocation
                  ? `Confirmed: ${confirmedLocation.formattedAddress}`
                  : "Required before the listing can go live."}
              </p>
            </div>
            <div className="mt-5">
              <SearchablePicker
                label="Region"
                placeholder="Choose the closest region…"
                searchPlaceholder="Search regions"
                value={regionId}
                onChange={setRegionId}
                groups={regionPickerGroups}
              />
            </div>
          </Card>

          <ChoiceSection title="Suitable livestock">
            {stockTypes.map((value) => (
              <SelectablePill
                key={value}
                selected={suitableLivestock.includes(value)}
                onClick={() => toggleLivestock(value)}
              >
                {value}
              </SelectablePill>
            ))}
          </ChoiceSection>

          <ChoiceSection
            title="Feed quality"
            noteLabel="Feed notes"
            noteValue={feedNote}
            onNoteChange={setFeedNote}
            notePlaceholder="e.g. Improved pasture with clover and ryegrass, hay available if feed tightens."
          >
            {feedOptions.map((value) => (
              <SelectablePill
                key={value}
                selected={feedStatus === value}
                onClick={() => setFeedStatus(value)}
              >
                {value}
              </SelectablePill>
            ))}
          </ChoiceSection>

          <ChoiceSection
            title="Water availability"
            noteLabel="Water notes"
            noteValue={waterNote}
            onNoteChange={setWaterNote}
            notePlaceholder="e.g. Permanent troughs on town water, two dams, checked twice weekly."
          >
            {waterOptions.map((value) => (
              <SelectablePill
                key={value}
                selected={waterStatus === value}
                onClick={() => setWaterStatus(value)}
              >
                {value}
              </SelectablePill>
            ))}
          </ChoiceSection>

          <ChoiceSection
            title="Fencing condition"
            noteLabel="Fencing notes"
            noteValue={fencingNote}
            onNoteChange={setFencingNote}
            notePlaceholder="e.g. Ringlock boundary, electric internal fence, north gate suitable for trucks."
          >
            {fencingOptions.map((value) => (
              <SelectablePill
                key={value}
                selected={fencingStatus === value}
                onClick={() => setFencingStatus(value)}
              >
                {value}
              </SelectablePill>
            ))}
          </ChoiceSection>

          <Card>
            <SectionTitle eyebrow="Step 2" title="Summary" />
            <p className="mt-2 text-sm font-medium text-bark/70">
              A short description farmers see first — mention feed, water, access and
              whether there are yards or a loading ramp.
            </p>
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={4}
              placeholder="River flats with strong autumn feed, permanent troughs, yards and north-gate truck access."
              className="mt-4 w-full rounded-[8px] border border-stone/35 bg-white px-4 py-3 text-base font-medium text-bark shadow-[inset_0_1px_2px_rgba(63,51,40,0.08)] outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/25 placeholder:text-stone/45"
            />
          </Card>
        </div>

        <aside className="space-y-5">
          <Card>
            <SectionTitle eyebrow="Photos" title="Paddock photos" />
            <p className="mt-2 text-sm font-medium text-bark/70">
              Add paddock, water point, fencing and yards shots. Up to {MAX_PHOTOS}{" "}
              images, 6 MB each.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                void handleFilesSelected(event.target.files);
                // Reset so re-selecting the same file fires onChange.
                event.target.value = "";
              }}
            />

            {photos.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {photos.map((src, index) => (
                  <figure
                    key={`${index}-${src.slice(0, 24)}`}
                    className="relative aspect-square overflow-hidden rounded-[8px] border border-mist bg-warm-white"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Paddock photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      aria-label={`Remove photo ${index + 1}`}
                      className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-warm-white/95 text-bark shadow-sm transition hover:bg-warm-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 rounded-sm bg-sage-deep px-2 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-wide text-cream">
                        Hero
                      </span>
                    )}
                  </figure>
                ))}
              </div>
            ) : (
              <div className="mt-4 flex min-h-40 flex-col items-center justify-center rounded-[8px] border border-dashed border-sage/45 bg-sage-mist/40 px-5 py-6 text-center">
                <Camera className="mb-2 h-7 w-7 text-sage-deep" aria-hidden />
                <p className="text-sm font-bold text-sage-deep">
                  No photos attached yet
                </p>
                <p className="mt-1 max-w-xs text-xs font-medium text-bark/70">
                  The first one you add becomes the hero shot on the listing card.
                </p>
              </div>
            )}

            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={photos.length >= MAX_PHOTOS}
              className="mt-4 w-full"
            >
              <ImagePlus className="h-4 w-4" aria-hidden />
              {photos.length === 0 ? "Add photos" : "Add more photos"}
              <span className="ml-1 text-xs font-semibold opacity-70">
                {photos.length}/{MAX_PHOTOS}
              </span>
            </Button>
          </Card>

          <Card className="sticky top-24">
            <SectionTitle eyebrow="Checklist" title="Publish readiness" />
            <div className="mt-4 space-y-3">
              <ChecklistRow
                done={title.trim().length > 0 && !!confirmedLocation}
                label="Name and location confirmed"
              />
              <ChecklistRow
                done={suitableLivestock.length > 0}
                label="Livestock suitability selected"
              />
              <ChecklistRow
                done={acres > 0 && summary.trim().length > 0}
                label="Acres and summary added"
              />
            </div>
            <Button
              type="button"
              onClick={publishListing}
              disabled={submitting}
              className="mt-5 w-full"
            >
              {submitting ? "Publishing…" : "Publish listing"}
            </Button>
          </Card>
        </aside>
      </div>
    </>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.16em] text-ochre">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-2xl font-extrabold leading-tight text-sage-deep">
        {title}
      </h2>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-stone">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 min-h-14 w-full rounded-[8px] border border-stone/35 bg-white px-4 text-lg font-extrabold text-bark shadow-[inset_0_1px_2px_rgba(63,51,40,0.08)] outline-none ring-0 transition focus:border-sage focus:ring-2 focus:ring-sage/25 placeholder:font-semibold placeholder:text-stone/45"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-stone">
        {label}
      </span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
        className="mt-2 min-h-14 w-full rounded-[8px] border border-stone/35 bg-white px-4 text-lg font-extrabold text-bark shadow-[inset_0_1px_2px_rgba(63,51,40,0.08)] outline-none ring-0 transition focus:border-sage focus:ring-2 focus:ring-sage/25"
      />
    </label>
  );
}

function ChoiceSection({
  title,
  children,
  noteLabel,
  noteValue,
  onNoteChange,
  notePlaceholder,
}: {
  title: string;
  children: React.ReactNode;
  noteLabel?: string;
  noteValue?: string;
  onNoteChange?: (value: string) => void;
  notePlaceholder?: string;
}) {
  return (
    <Card>
      <SectionTitle eyebrow="Select" title={title} />
      <div className="mt-5 flex flex-wrap gap-2">{children}</div>
      {noteLabel && onNoteChange && (
        <label className="mt-5 block">
          <span className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-stone">
            {noteLabel}
          </span>
          <textarea
            value={noteValue ?? ""}
            onChange={(event) => onNoteChange(event.target.value)}
            rows={3}
            maxLength={360}
            placeholder={notePlaceholder}
            className="mt-2 w-full rounded-[8px] border border-stone/35 bg-white px-4 py-3 text-base font-medium text-bark shadow-[inset_0_1px_2px_rgba(63,51,40,0.08)] outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/25 placeholder:text-stone/45"
          />
        </label>
      )}
    </Card>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Photos are stored inline as data URLs on the paddock row. A raw phone photo
// is several MB; attaching a few of them produced an insert payload large
// enough to fail the publish request ("Could not publish the listing").
// Resize each image down to a sensible max dimension and re-encode as JPEG so a
// full set of photos stays small (~150-350 KB each). Falls back to the original
// data URL if the browser can't decode/encode the image for any reason.
async function readCompressedDataUrl(file: File): Promise<string> {
  const MAX_DIMENSION = 1600;
  const JPEG_QUALITY = 0.72;
  const original = await readAsDataUrl(file);

  try {
    const image = await loadImage(original);
    let width = image.width;
    let height = image.height;
    if (width === 0 || height === 0) return original;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return original;
    ctx.drawImage(image, 0, 0, width, height);

    const compressed = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    // Guard against the rare case where re-encoding produces a larger string.
    return compressed.length < original.length ? compressed : original;
  } catch {
    return original;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not decode image"));
    image.src = src;
  });
}

function ChecklistRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-bark">
      {done ? (
        <CheckCircle className="h-5 w-5 text-match" aria-hidden />
      ) : (
        <Circle className="h-5 w-5 text-stone/40" aria-hidden />
      )}
      {label}
    </div>
  );
}
