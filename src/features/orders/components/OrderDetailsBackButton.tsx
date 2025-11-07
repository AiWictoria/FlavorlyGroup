import "./orders.css";

export function StoreManagerBtn({ onClick }: { onClick: () => void; }) {
    return (
        <button className="storemanagerbtn" onClick={onClick} >
            Tillbaka till Orderhantering
        </button>
    );
}
