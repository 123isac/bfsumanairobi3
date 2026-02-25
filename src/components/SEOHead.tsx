import { useEffect } from "react";

interface SEOHeadProps {
    title?: string;
    description?: string;
}

const DEFAULT_TITLE = "BF Suma — Premium Wellness Products";
const DEFAULT_DESC = "Discover authentic BF Suma wellness, health, and beauty products. Shop online for fast delivery across Kenya.";

const SEOHead = ({ title, description }: SEOHeadProps) => {
    const fullTitle = title ? `${title} — BF Suma` : DEFAULT_TITLE;
    const metaDesc = description || DEFAULT_DESC;

    useEffect(() => {
        document.title = fullTitle;

        let metaTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
        if (!metaTag) {
            metaTag = document.createElement("meta");
            metaTag.name = "description";
            document.head.appendChild(metaTag);
        }
        metaTag.content = metaDesc;

        // Open Graph
        const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]') ||
            (() => { const el = document.createElement("meta"); el.setAttribute("property", "og:title"); document.head.appendChild(el); return el; })();
        ogTitle.content = fullTitle;

        const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]') ||
            (() => { const el = document.createElement("meta"); el.setAttribute("property", "og:description"); document.head.appendChild(el); return el; })();
        ogDesc.content = metaDesc;
    }, [fullTitle, metaDesc]);

    return null;
};

export default SEOHead;
