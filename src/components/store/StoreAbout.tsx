import type { Store } from "@/types";

interface StoreAboutProps {
  store: Store;
  memberSince?: string;
  sellerName?: string;
  isTopRated?: boolean;
}

export function StoreAbout({
  store,
  memberSince,
  sellerName,
  isTopRated,
}: StoreAboutProps) {
  // Format the date
  const formattedDate = memberSince
    ? new Date(memberSince).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : store.dateCreated
      ? new Date(store.dateCreated).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "N/A";

  return (
    <div className="space-y-8">
      {/* About Section */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>

        {store.description && (
          <p className="text-gray-700 mb-6">{store.description}</p>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 min-w-[100px]">
              Location:
            </span>
            <span className="text-sm font-medium text-gray-900">
              {store.institutionID ? "Campus Location" : "United States"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 min-w-[100px]">
              Member since:
            </span>
            <span className="text-sm font-medium text-gray-900">
              {formattedDate}
            </span>
          </div>
          {sellerName && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 min-w-[100px]">
                Seller:
              </span>
              <a
                href="#"
                className="text-sm font-medium text-blue-700 hover:underline"
              >
                {sellerName}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Top Rated Seller Badge */}
      {(isTopRated || store.isVerified) && (
        <section className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Top Rated Seller
          </h3>
          <p className="text-sm text-gray-700">
            {store.storeName} is one of Campuzon's most reputable sellers.
            Consistently delivers outstanding customer service{" "}
            <a href="#" className="text-blue-700 hover:underline">
              Learn more
            </a>
          </p>
        </section>
      )}

      {/* Contact Information */}
      <section className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Contact Information
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 min-w-[100px]">Email:</span>
            <a
              href={`mailto:${store.email}`}
              className="text-sm text-blue-700 hover:underline"
            >
              {store.email}
            </a>
          </div>
          {store.phoneNumber && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 min-w-[100px]">
                Phone:
              </span>
              <a
                href={`tel:${store.phoneNumber}`}
                className="text-sm text-blue-700 hover:underline"
              >
                {store.phoneNumber}
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
