interface OrderInfoSectionProps {
  title: string;
  adress?: string;
  postcode?: string;
  city?: string;
  paymethod?: string;
}

export default function OrderInfoSection({
  title,
  adress,
  postcode,
  city,
  paymethod,
}: OrderInfoSectionProps) {
  return (
    <>
      <div>
        <p className="fw-bold">{title}</p>
        {adress && (
          <div>
            <p>{adress}</p>
            <div className=" d-flex gap-3">
              <p>{postcode}</p>
              <p>{city}</p>
            </div>
          </div>
        )}
        {paymethod && <p>{paymethod}</p>}
      </div>
    </>
  );
}
