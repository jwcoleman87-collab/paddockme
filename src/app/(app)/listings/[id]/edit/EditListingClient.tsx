"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2, X } from "lucide-react";
import { Button, ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { useFlash } from "@/components/FlashProvider";
import { PageHeader } from "@/components/PageHeader";
import { SelectablePill } from "@/components/SelectablePill";
import { stockTypes, type PaddockListing } from "@/lib/dummyData";
import {
  deletePaddockListingRecord,
  listPaddockListings,
  updatePaddockListingRecord,
} from "@/lib/data/repositories";
import {
  geocodeLocation,
  type GeocodedLocation,
} from "@/lib/locationGeocode";
import { regions } from "@/lib/regions";

const feedOptions: PaddockListing["feedStatus"][] = ["Excellent", "Good", "Tight"];
const waterOptions: PaddockListing["waterStatus"][] = ["Permanent", "Seasonal", "Tank"];
const fencingOptions: PaddockListing["fencingStatus"][] = [
  "Secure",
  "Good",
  "Needs inspection",
];
const MAX_PHOTOS = 6;
const MAX_BYTES_PER_PHOTO = 6 * 1024 * 1024;

export function EditListingClient({ id }: { id: string }) {
  const router = useRouter();
  const flash = useFlash();

  const [status, setStatus] = useState<"loading" | "ready" | "missing">(
    "loading"
  );
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [region, setRegion] = useState("");
  const [acres, setAcres] = useState(200);
  const [suitableLivestock, setSuitableLivestock] = useState<string[]>([]);
  const [feedStatus, setFeedStatus] =
    useState<PaddockListing["feedStatus"]>("Good");
  const [waterStatus, setWaterStatus] =
    useState<PaddockListing["waterStatus"]>("Permanent");
  const [fencingStatus, setFencingStatus] =
    useState<PaddockListing["fencingStatus"]>("Good");
  const [feedNote, setFeedNote] = useState("");
  const [waterNote, setWaterNote] = useState("");
  const [fencingNote, setFencingNote] = useState("");
  const [availabilityWindow, setAvailabilityWindow] = useState("");
  const [summary, setSummary] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [confirmedLocation, setConfirmedLocation] =
    useState<GeocodedLocation | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;
    void listPaddockListings().then((listings) => {
      if (!active) return;
      const listing = listings.find((item) => item.id === id);
      if (!listing) {
        setStatus("missing");
        return;
      }
      setTitle(listing.title);
      setLocation(listing.location);
      setConfirmedLocation(
        listing.coordinates
          ? {
              formattedAddress: listing.location,
              latitude: listing.coordinates.latitude,
              longitude: listing.coordinates.longitude,
              placeId: null,
            }
          : null
      );
      setRegion(listing.region);
      setAcres(listing.acres);
      setSuitableLivestock(listing.suitableLivestock);
      setFeedStatus(listing.feedStatus);
      setWaterStatus(listing.waterStatus);
      setFencingStatus(listing.fencingStatus);
      setFeedNote(listing.feedNote ?? "");
      setWaterNote(listing.waterNote ?? "");
      setFencingNote(listing.fencingNote ?? "");
      setAvailabilityWindow(listing.availabilityWindow);
      setSummary(listing.summary);
      setPhotos(listing.photos ?? []);
      setStatus("ready");
    });
    return () => {
      active = false;
    };
  }, [id]);

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      flash(`You can attach up to ${MAX_PHOTOS} photos.`, "warning");
      return;
    }
    const accepted: File[] = [];
    for (const file of Array.from(fileList).slice(0, room)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_BYTES_PER_PHOTO) continue;
      accepted.push(file);
    }
    const dataUrls = await Promise.all(accepted.map(readCompressedDataUrl));
    setPhotos((current) => [...current, ...dataUrls]);
  }

  function toggleLivestock(value: string) {
    setSuitableLivestock((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  async function save() {
    if (submitting) return;
    if (!title.trim()) {
      flash("Add a name for your listing.", "warning");
      return;
    }
    if (!region) {
      flash("Pick a region.", "warning");
      return;
    }
    if (!confirmedLocation) {
      flash("Confirm the property location before saving.", "warning");
      return;
    }
    if (suitableLivestock.length === 0) {
      flash("Pick at least one suitable livestock type.", "warning");
      return;
    }
    setSubmitting(true);
    try {
      const result = await updatePaddockListingRecord(id, {
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
      if (!result) {
        flash("Could not save changes. Please try again.", "warning");
        setSubmitting(false);
        return;
      }
      flash("Listing updated.", "success");
      router.push(`/listings/${id}`);
    } catch {
      flash("Could not save changes. Please try again.", "warning");
      setSubmitting(false);
    }
  }

  async function remove() {
    if (submitting) return;
    const ok = window.confirm(
      "Remove this paddock listing? This cannot be undone."
    );
    if (!ok) return;
    setSubmitting(true);
    try {
      const done = await deletePaddockListingRecord(id);
      if (!done) {
        flash("Could not remove the listing. Please try again.", "warning");
        setSubmitting(false);
        return;
      }
      flash("Listing removed.", "success");
      router.push("/listings/mine");
    } catch {
      flash("Could not remove the listing. Please try again.", "warning");
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

  if (status === "loading") {
    return (
      <Card className="text-center">
        <h2 className="text-lg font-bold text-sage-deep">Loading listing.</h2>
      </Card>
    );
  }
  if (status === "missing") {
    return (
      <Card className="text-center">
        <h2 className="text-lg font-bold text-sage-deep">Listing not found.</h2>
        <p className="mt-2 text-sm text-bark/70">
          This paddock could not be found, or it is not yours to edit.
        </p>
        <ButtonLink href="/listings/mine" className="mt-4 inline-flex">
          Back to my paddocks
        </ButtonLink>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Edit paddock"
        title="Update your listing."
        description="Change the details livestock owners see. Saving updates the live listing straight away."
        action={
          <ButtonLink href="/listings/mine" variant="secondary">
            Back to my paddocks
          </ButtonLink>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.55fr]">
        <div className="space-y-5">
          <Card>
            <SectionTitle title="Property basics" />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Listing name">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Location">
                <input
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setConfirmedLocation(null);
                  }}
                  className={inputClass}
                />
              </Field>
              <Field label="Available acres">
                <input
                  type="number"
                  min={0}
                  value={acres}
                  onChange={(e) =>
                    setAcres(Math.max(0, Number(e.target.value) || 0))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Region">
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Choose a region</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.label}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={confirmListingLocation}
                  disabled={geocoding}
                >
                  {geocoding ? "Checking location" : "Confirm location"}
                </Button>
                <p className="mt-2 text-sm font-bold text-bark/70">
                  {confirmedLocation
                    ? `Confirmed: ${confirmedLocation.formattedAddress}`
                    : "Required before saving."}
                </p>
              </div>
              <div className="sm:col-span-2">
                <Field label="Availability window">
                  <input
                    value={availabilityWindow}
                    onChange={(e) => setAvailabilityWindow(e.target.value)}
                    placeholder="e.g. 18 May to 30 September"
                    className={inputClass}
                  />
                </Field>
              </div>
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
            <SectionTitle title="Summary" />
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className={`${inputClass} mt-3`}
            />
          </Card>
        </div>

        <aside className="space-y-5">
          <Card>
            <SectionTitle title="Photos" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                void handleFilesSelected(e.target.files);
                e.target.value = "";
              }}
            />
            {photos.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {photos.map((src, index) => (
                  <figure
                    key={`${index}-${src.slice(0, 16)}`}
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
                      onClick={() =>
                        setPhotos((cur) => cur.filter((_, i) => i !== index))
                      }
                      aria-label={`Remove photo ${index + 1}`}
                      className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-warm-white/95 text-bark shadow-sm"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-bark/70">No photos attached.</p>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={photos.length >= MAX_PHOTOS}
              className="mt-4 w-full"
            >
              <ImagePlus className="h-4 w-4" aria-hidden />
              Add photos
              <span className="ml-1 text-xs font-semibold opacity-70">
                {photos.length}/{MAX_PHOTOS}
              </span>
            </Button>
          </Card>

          <Card className="sticky top-24">
            <Button
              type="button"
              onClick={save}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? "Saving." : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={remove}
              disabled={submitting}
              className="mt-2 w-full text-red-700"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Remove listing
            </Button>
          </Card>
        </aside>
      </div>
    </>
  );
}

const inputClass =
  "w-full rounded-[8px] border border-stone/35 bg-white px-4 py-3 text-base font-medium text-bark outline-none transition focus:border-sage focus:ring-2 focus:ring-sage/25";

function SectionTitle({ title }: { title: string }) {
  return (
    <h2 className="text-xl font-extrabold leading-tight text-sage-deep">
      {title}
    </h2>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[0.78rem] font-extrabold uppercase tracking-[0.1em] text-stone">
        {label}
      </span>
      <div className="mt-2">{children}</div>
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
      <SectionTitle title={title} />
      <div className="mt-4 flex flex-wrap gap-2">{children}</div>
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
            className={`${inputClass} mt-2`}
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
