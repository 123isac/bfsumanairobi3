import { useEffect } from "react";

interface SEOHeadProps {
    title?: string;
    description?: string;
    image?: string;
    type?: "website" | "product";
    /** Pass the full canonical URL for this page, e.g. https://bfsumanairobi3.com/product/abc */
    canonical?: string;
}

const SITE_URL = "https://bfsumanairobi3.com";
const DEFAULT_TITLE = "BF Suma Nairobi — Premium Wellness Products";
const DEFAULT_DESC = "Authentic BF Suma wellness products in Nairobi, Kenya. Immune boosters, digestive health, bone & joint care, cardiovascular support & more. Science-led nutrition.";
const DEFAULT_IMAGE = `${SITE_URL}/bf-suma-og-image.jpg`;

const setMeta = (selector: string, attr: string, value: string, attrKey = "content") => {
    let el = document.querySelector<HTMLMetaElement>(selector);
    if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, selector.replace(/.*["']([^"']+)["'].*/, "$1"));
        document.head.appendChild(el);
    }
    el.setAttribute(attrKey, value);
};

const SEOHead = ({ title, description, image, type = "website", canonical }: SEOHeadProps) => {
    const fullTitle = title ? `${title} — BF Suma Nairobi` : DEFAULT_TITLE;
    const metaDesc = description || DEFAULT_DESC;
    const ogImage = image || DEFAULT_IMAGE;
    const pageUrl = canonical || (typeof window !== "undefined" ? window.location.href : SITE_URL);

    useEffect(() => {
        // Title
        document.title = fullTitle;

        // Description
        let descTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
        if (!descTag) {
            descTag = document.createElement("meta");
            descTag.name = "description";
            document.head.appendChild(descTag);
        }
        descTag.content = metaDesc;

        // Canonical
        let canonicalTag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (!canonicalTag) {
            canonicalTag = document.createElement("link");
            canonicalTag.rel = "canonical";
            document.head.appendChild(canonicalTag);
        }
        canonicalTag.href = pageUrl;

        // Open Graph
        const ogMetas: Record<string, string> = {
            "og:title": fullTitle,
            "og:description": metaDesc,
            "og:image": ogImage,
            "og:url": pageUrl,
            "og:type": type,
            "og:site_name": "BF Suma Nairobi",
        };
        for (const [prop, val] of Object.entries(ogMetas)) {
            let el = document.querySelector<HTMLMetaElement>(`meta[property="${prop}"]`);
            if (!el) {
                el = document.createElement("meta");
                el.setAttribute("property", prop);
                document.head.appendChild(el);
            }
            el.content = val;
        }

        // Twitter Card
        const twitterMetas: Record<string, string> = {
            "twitter:title": fullTitle,
            "twitter:description": metaDesc,
            "twitter:image": ogImage,
        };
        for (const [name, val] of Object.entries(twitterMetas)) {
            let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
            if (!el) {
                el = document.createElement("meta");
                el.name = name;
                document.head.appendChild(el);
            }
            el.content = val;
        }
    }, [fullTitle, metaDesc, ogImage, pageUrl, type]);

    return null;
};

export default SEOHead;
